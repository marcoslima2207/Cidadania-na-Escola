import time
from io import StringIO
from types import SimpleNamespace
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import PBKDF2PasswordHasher
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .clerk_auth import clerk_api, local_user, verify_session
from .management.commands.migrate_clerk_users import import_payload
from .models import ClerkIdentity, Profile

ISSUER = 'https://example.clerk.accounts.dev'


@override_settings(CLERK_ENABLED=True, CLERK_ISSUER=ISSUER,
                   CLERK_AUTHORIZED_PARTIES=['http://localhost:4200'])
class SessionValidationTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    def verify(self, **changes):
        now = int(time.time())
        claims = dict(iss=ISSUER, sub='user_test', sid='sess_test',
                      azp='http://localhost:4200', iat=now, nbf=now, exp=now + 60)
        claims.update(changes)
        token = jwt.encode(claims, self.key, algorithm='RS256', headers={'kid': 'test'})
        with patch('api.clerk_auth.jwks_client') as client:
            client.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key=self.key.public_key())
            return verify_session(token)

    def test_valid_signed_session(self):
        self.assertEqual(self.verify()['sub'], 'user_test')

    @override_settings(CLERK_SECRET_KEY='test-key-not-real')
    def test_backend_request_identifies_the_application_to_the_provider(self):
        with patch('api.clerk_auth.urlopen') as open_url:
            open_url.return_value.__enter__.return_value.read.return_value = b'{"keys": []}'
            self.assertEqual(clerk_api('jwks'), {'keys': []})
            request = open_url.call_args.args[0]
            self.assertEqual(request.get_header('User-agent'), 'CidadaniaNaEscola/1.0')
            self.assertEqual(open_url.call_args.kwargs['timeout'], 10)

    def test_expired_wrong_issuer_origin_and_pending_are_rejected(self):
        for changes in [dict(exp=int(time.time()) - 60), dict(iss='https://other.example'),
                        dict(azp='https://attacker.example'), dict(azp=None),
                        dict(sts='pending'), dict(sub=''), dict(sid='')]:
            with self.subTest(changes=changes), self.assertRaises(AuthenticationFailed):
                self.verify(**changes)

    def test_forged_signature_is_rejected(self):
        token = jwt.encode(dict(iss=ISSUER), 'a' * 32, algorithm='HS256')
        with patch('api.clerk_auth.jwks_client') as client:
            client.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key=self.key.public_key())
            with self.assertRaises(AuthenticationFailed):
                verify_session(token)

    @override_settings(CLERK_ENABLED=False)
    def test_disabled_provider_rejects_bearer(self):
        with self.assertRaises(AuthenticationFailed):
            verify_session('anything')


@override_settings(CLERK_ISSUER=ISSUER)
class IdentityTests(TestCase):
    def setUp(self):
        self.remote = dict(id='user_test', external_id=None, first_name='Aluna',
                           primary_email_address_id='email_test', email_addresses=[{
                               'id': 'email_test', 'email_address': 'aluna@example.com',
                               'verification': {'status': 'verified'},
                           }])

    def test_import_keeps_local_id_profile_and_password(self):
        user = get_user_model().objects.create_user(username='aluna', email='aluna@example.com', password=None)
        profile = Profile.objects.create(user=user, bio='Minha bio')
        self.remote['external_id'] = f'django:{user.pk}'
        with patch('api.clerk_auth.clerk_api', return_value=self.remote):
            result = local_user('user_test')
        self.assertEqual(result.pk, user.pk)
        self.assertEqual(result.profile.pk, profile.pk)
        self.assertEqual(result.profile.bio, 'Minha bio')
        self.assertEqual(get_user_model().objects.count(), 1)

    def test_matching_email_alone_never_links_an_existing_account(self):
        get_user_model().objects.create_user(username='old', email='aluna@example.com', password=None)
        with patch('api.clerk_auth.clerk_api', return_value=self.remote):
            with self.assertRaises(AuthenticationFailed):
                local_user('user_test')
        self.assertFalse(ClerkIdentity.objects.exists())

    def test_new_verified_user_gets_local_profile_and_unusable_password(self):
        with patch('api.clerk_auth.clerk_api', return_value=self.remote):
            user = local_user('user_test')
        self.assertFalse(user.has_usable_password())
        self.assertTrue(Profile.objects.filter(user=user).exists())
        with patch('api.clerk_auth.clerk_api') as api:
            self.assertEqual(local_user('user_test').pk, user.pk)
            api.assert_not_called()

    def test_unverified_email_does_not_create_user(self):
        self.remote['email_addresses'][0]['verification']['status'] = 'unverified'
        with patch('api.clerk_auth.clerk_api', return_value=self.remote):
            with self.assertRaises(AuthenticationFailed):
                local_user('user_test')
        self.assertFalse(get_user_model().objects.exists())

    def test_inactive_linked_user_is_denied(self):
        user = get_user_model().objects.create_user(username='old', is_active=False)
        ClerkIdentity.objects.create(user=user, issuer=ISSUER, subject='user_test')
        with self.assertRaises(AuthenticationFailed):
            local_user('user_test')

    def test_password_import_uses_django_hasher_and_dry_run_never_sends_data(self):
        digest = PBKDF2PasswordHasher().encode('example-only', 'testsalt', iterations=1000)
        user = get_user_model().objects.create(username='old', email='aluna@example.com', password=digest)
        payload = import_payload(user)
        self.assertEqual(payload['password_digest'], digest)
        self.assertEqual(payload['password_hasher'], 'pbkdf2_sha256_django')
        self.assertEqual(payload['external_id'], f'django:{user.pk}')
        output = StringIO()
        with patch('api.management.commands.migrate_clerk_users.clerk_api') as api:
            call_command('migrate_clerk_users', stdout=output)
            api.assert_not_called()
        self.assertNotIn(digest, output.getvalue())
        self.assertNotIn(user.email, output.getvalue())

    @override_settings(LEGACY_AUTH_ENABLED=False)
    def test_cutover_rejects_old_tokens_and_old_login_endpoints(self):
        user = get_user_model().objects.create_user(username='old', email='old@example.com')
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        self.assertEqual(client.get('/api/auth/profile/').status_code, 401)
        client.credentials()
        for endpoint in ['login', 'register', 'google']:
            with self.subTest(endpoint=endpoint):
                self.assertEqual(client.post(f'/api/auth/{endpoint}/', {}).status_code, 403)
