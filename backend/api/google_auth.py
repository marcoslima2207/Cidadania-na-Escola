import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from rest_framework import serializers
from rest_framework.exceptions import APIException

from .models import GoogleIdentity, GoogleLoginNonce


def google_config():
    if not settings.GOOGLE_CLIENT_ID:
        return {"client_id": "", "nonce": ""}
    nonce = secrets.token_urlsafe(32)
    GoogleLoginNonce.objects.filter(expires_at__lt=timezone.now()).delete()
    GoogleLoginNonce.objects.create(
        digest=hashlib.sha256(nonce.encode()).hexdigest(),
        expires_at=timezone.now() + timedelta(minutes=10),
    )
    return {"client_id": settings.GOOGLE_CLIENT_ID, "nonce": nonce}


class GoogleCredentialSerializer(serializers.Serializer):
    credential = serializers.CharField(max_length=10000, write_only=True)

    def validate(self, attrs):
        if not settings.GOOGLE_CLIENT_ID:
            error = APIException("O acesso com Google ainda não foi configurado.")
            error.status_code = 503
            raise error
        try:
            claims = id_token.verify_oauth2_token(
                attrs["credential"], Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError as exc:
            raise serializers.ValidationError("Credencial Google inválida ou expirada.") from exc
        except GoogleAuthError as exc:
            error = APIException("Não foi possível verificar sua conta Google. Tente novamente.")
            error.status_code = 503
            raise error from exc
        nonce = claims.get("nonce", "")
        consumed, _ = GoogleLoginNonce.objects.filter(
            digest=hashlib.sha256(nonce.encode()).hexdigest(),
            expires_at__gte=timezone.now(),
        ).delete()
        if not nonce or not consumed:
            raise serializers.ValidationError(
                "O acesso expirou. Atualize a página e tente novamente."
            )
        if not claims.get("sub") or not claims.get("email_verified") or not claims.get("email"):
            raise serializers.ValidationError("Use uma conta Google com e-mail verificado.")
        return claims

    @transaction.atomic
    def create(self, claims):
        User = get_user_model()
        identity = (
            GoogleIdentity.objects.select_related("user").filter(subject=claims["sub"]).first()
        )
        if identity:
            user = identity.user
        else:
            email = claims["email"].lower()
            users = User.objects.select_for_update().filter(email__iexact=email)
            if users.count() > 1:
                raise serializers.ValidationError(
                    "Há mais de uma conta com este e-mail. Entre com sua senha."
                )
            user = users.first()
            if user:
                # Só associa automaticamente quando Google é a autoridade do e-mail.
                if (
                    not (email.endswith("@gmail.com") or claims.get("hd"))
                    or GoogleIdentity.objects.filter(user=user).exists()
                ):
                    raise serializers.ValidationError(
                        "Esta conta já existe. Entre com seu e-mail e senha."
                    )
            else:
                user = User.objects.create_user(
                    username=f"google_{secrets.token_hex(12)}",
                    email=email,
                    first_name=claims.get("name", "")[:150],
                    password=None,
                )
            GoogleIdentity.objects.create(user=user, subject=claims["sub"])
        if not user.is_active:
            raise serializers.ValidationError("Esta conta está inativa.")
        return user
