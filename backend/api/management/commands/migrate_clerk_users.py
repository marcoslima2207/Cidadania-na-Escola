"""Importação explícita e repetível; sem --apply apenas verifica os dados locais."""
import re
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from api.clerk_auth import clerk_api
from api.models import ClerkIdentity


def import_payload(user):
    email = user.email.strip().lower()
    try:
        validate_email(email)
    except ValidationError as exc:
        raise CommandError(f'Usuário {user.pk}: e-mail ausente ou inválido.') from exc
    if get_user_model().objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
        raise CommandError(f'Usuário {user.pk}: e-mail duplicado; resolva antes de importar.')
    payload = {
        'external_id': f'django:{user.pk}', 'email_address': [email],
        'first_name': user.first_name, 'last_name': user.last_name,
        # Mantém usernames compatíveis; o nome de exibição local nunca é alterado.
        'username': user.username if (
            re.fullmatch(r'[a-zA-Z0-9_-]{4,64}', user.username)
            and re.search(r'[a-zA-Z]', user.username)
        ) else f'aluno_{user.pk}',
    }
    if user.has_usable_password():
        if not user.password.startswith('pbkdf2_sha256$'):
            raise CommandError(f'Usuário {user.pk}: hash não suportado por esta importação.')
        payload.update(password_digest=user.password, password_hasher='pbkdf2_sha256_django')
    else:
        payload['skip_password_requirement'] = True
    return payload


class Command(BaseCommand):
    help = 'Verifica/importa contas comuns do Django no Clerk preservando external_id.'

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true')
        parser.add_argument('--user-id', type=int, action='append')

    def handle(self, *args, **options):
        users = get_user_model().objects.filter(is_active=True, is_staff=False, is_superuser=False)
        if options['user_id']:
            users = users.filter(pk__in=options['user_id'])
        # Valida o lote inteiro antes de qualquer requisição externa.
        prepared = [(user, import_payload(user)) for user in users.order_by('pk')]
        self.stdout.write(f'{len(prepared)} conta(s) elegível(is). Nenhuma senha ou e-mail será exibido.')
        if not options['apply']:
            self.stdout.write('Simulação concluída. Use --apply somente na instância desejada.')
            return
        if not settings.CLERK_ISSUER.startswith('https://') or not settings.CLERK_SECRET_KEY:
            raise CommandError('Configure CLERK_ISSUER e CLERK_SECRET_KEY no servidor.')
        for user, payload in prepared:
            if ClerkIdentity.objects.filter(issuer=settings.CLERK_ISSUER, user=user).exists():
                self.stdout.write(f'Usuário {user.pk}: já vinculado.')
                continue
            result = clerk_api('users?' + urlencode({'external_id[]': payload['external_id']}))
            rows = result if isinstance(result, list) else result['data']
            if len(rows) > 1:
                raise CommandError(f'Usuário {user.pk}: múltiplas identidades; revise o Clerk.')
            remote = rows[0] if rows else clerk_api('users', data=payload)
            if remote.get('external_id') != payload['external_id']:
                raise CommandError('O Clerk devolveu uma identidade diferente. Importação interrompida.')
            ClerkIdentity.objects.create(
                user=user, issuer=settings.CLERK_ISSUER, subject=remote['id'],
            )
            self.stdout.write(f'Usuário {user.pk}: vinculado.')
