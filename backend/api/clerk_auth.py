"""Valida sessões Clerk sem trocar os IDs usados pelos dados da aplicação."""
import json
import secrets
from functools import lru_cache
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework.authentication import BaseAuthentication, TokenAuthentication, get_authorization_header
from rest_framework.exceptions import APIException, AuthenticationFailed

from .models import ClerkIdentity, Profile


def unavailable():
    error = APIException('O serviço de autenticação está indisponível. Tente novamente.')
    error.status_code = 503
    return error


def clerk_api(path, *, data=None):
    if not settings.CLERK_SECRET_KEY:
        raise unavailable()
    request = Request(
        'https://api.clerk.com/v1/' + path,
        data=json.dumps(data).encode() if data is not None else None,
        headers={
            'Authorization': 'Bearer ' + settings.CLERK_SECRET_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            # O User-Agent padrão do urllib é recusado pela proteção da API Clerk.
            'User-Agent': 'CidadaniaNaEscola/1.0',
        },
    )
    try:
        with urlopen(request, timeout=10) as response:
            return json.load(response)
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        # Não registra chaves, hashes, tokens ou corpos de erro do provedor.
        raise unavailable() from exc


@lru_cache(maxsize=4)
def jwks_client(issuer):
    return jwt.PyJWKClient(issuer + '/.well-known/jwks.json', timeout=10)


def verify_session(token):
    issuer = settings.CLERK_ISSUER
    if not settings.CLERK_ENABLED or not issuer.startswith('https://'):
        raise AuthenticationFailed('O acesso Clerk ainda não foi habilitado.')
    try:
        key = jwks_client(issuer).get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token, key, algorithms=['RS256'], issuer=issuer, leeway=5,
            options={'require': ['exp', 'iat', 'nbf', 'iss', 'sub', 'sid'], 'verify_aud': False},
        )
    except jwt.PyJWKClientConnectionError as exc:
        raise unavailable() from exc
    except (jwt.PyJWTError, ValueError, TypeError) as exc:
        raise AuthenticationFailed('Sessão inválida ou expirada. Entre novamente.') from exc
    if (
        claims.get('azp') not in settings.CLERK_AUTHORIZED_PARTIES
        or claims.get('sts') == 'pending'
        or not str(claims['sub']).startswith('user_')
        or not str(claims['sid']).startswith('sess_')
    ):
        raise AuthenticationFailed('Sessão não autorizada para este site.')
    return claims


def local_user(subject):
    issuer = settings.CLERK_ISSUER
    identity = ClerkIdentity.objects.select_related('user').filter(
        issuer=issuer, subject=subject
    ).first()
    if identity:
        user = identity.user
    else:
        remote = clerk_api('users/' + quote(subject, safe=''))
        if remote.get('id') != subject or remote.get('banned') or remote.get('locked'):
            raise AuthenticationFailed('Conta indisponível.')
        emails = [
            row['email_address'].lower()
            for row in remote.get('email_addresses', [])
            if (row.get('verification') or {}).get('status') == 'verified'
        ]
        if not emails:
            raise AuthenticationFailed('Confirme seu e-mail para continuar.')
        primary = next((
            row['email_address'].lower() for row in remote['email_addresses']
            if row['id'] == remote.get('primary_email_address_id')
            and row['email_address'].lower() in emails
        ), emails[0])
        User = get_user_model()
        try:
            with transaction.atomic():
                # external_id vem exclusivamente da API autenticada do Clerk.
                external_id = remote.get('external_id') or ''
                if external_id.startswith('django:') and external_id[7:].isdigit():
                    user = User.objects.select_for_update().get(pk=int(external_id[7:]))
                elif external_id:
                    raise AuthenticationFailed('Esta conta precisa de revisão da migração.')
                else:
                    if User.objects.filter(email__iexact=primary).exists():
                        # E-mail coincidente não prova propriedade da conta antiga.
                        raise AuthenticationFailed(
                            'Sua conta já existe no site. Use o acesso anterior até a migração.'
                        )
                    user = User.objects.create_user(
                        username='clerk_' + secrets.token_hex(12), email=primary,
                        first_name=(remote.get('first_name') or '')[:150],
                        last_name=(remote.get('last_name') or '')[:150], password=None,
                    )
                if not user.is_active:
                    raise AuthenticationFailed('Esta conta está inativa.')
                ClerkIdentity.objects.create(user=user, issuer=issuer, subject=subject)
                Profile.objects.get_or_create(user=user)
        except User.DoesNotExist as exc:
            raise AuthenticationFailed('Conta local não encontrada. Revise a migração.') from exc
        except IntegrityError as exc:
            identity = ClerkIdentity.objects.select_related('user').filter(
                issuer=issuer, subject=subject
            ).first()
            if not identity:
                raise AuthenticationFailed('Esta conta já possui outro vínculo Clerk.') from exc
            user = identity.user
    if not user.is_active:
        raise AuthenticationFailed('Esta conta está inativa.')
    return user


class ClerkAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header or header[0].lower() != b'bearer':
            return None
        if len(header) != 2:
            raise AuthenticationFailed('Cabeçalho de autenticação inválido.')
        try:
            token = header[1].decode('ascii')
        except UnicodeError as exc:
            raise AuthenticationFailed('Credencial inválida.') from exc
        claims = verify_session(token)
        return local_user(claims['sub']), claims

    def authenticate_header(self, request):
        return 'Bearer'


class LegacyTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        if not settings.LEGACY_AUTH_ENABLED:
            return None
        return super().authenticate(request)
