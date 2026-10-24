# Valida os dados recebidos pela API e converte registros do banco em respostas JSON.
from pathlib import Path

from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Conteudo, Pergunta, Post, PostComment, Profile, Resultado, Usuario
from .user_display import user_display_name

User = get_user_model()


# AUTENTICAÇÃO: valida credenciais por e-mail ou nome de usuário.
class LoginSerializer(serializers.Serializer):
    # A senha é recebida nas requisições, mas nunca incluída nas respostas JSON.
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    # Localiza o usuário e verifica sua senha e seu estado ativo antes de emitir um token.
    def validate(self, attrs):
        entered_value = attrs["username"]

        user = None
        field = "email" if "@" in entered_value else "username"
        try:
            user = User.objects.get(**{field: entered_value})
        except User.DoesNotExist:
            user = None

        # Tenta também o mecanismo padrão de autenticação quando a busca direta falha.
        if not user:
            user = authenticate(username=entered_value, password=attrs["password"])

        if not user or not user.is_active:
            raise serializers.ValidationError("Credenciais inválidas.")

        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError("Credenciais inválidas.")

        return {"user": user}


# AUTENTICAÇÃO: cria usuário e username derivado do e-mail.
class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    # Recusa um e-mail já cadastrado e normaliza o endereço para letras minúsculas.
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return value.lower()

    # Cria o usuário com senha protegida e resolve usernames repetidos.
    def create(self, validated_data):
        email = validated_data["email"]
        base_username = email.split("@")[0].lower()
        username = base_username
        suffix = 1

        # Acrescenta um número quando duas contas têm a mesma parte inicial do e-mail.
        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f"{base_username}{suffix}"

        # create_user transforma a senha em hash antes de gravá-la no banco.
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
            first_name=validated_data["name"][:150],
        )
        return user


# POSTAGENS: normaliza autor, perfil, likes e comentários para o frontend.
class PostSerializer(serializers.ModelSerializer):
    # Campos calculados complementam os campos do modelo sem aceitar valores do cliente.
    author = serializers.SerializerMethodField()
    author_display_name = serializers.SerializerMethodField()
    author_profile = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()
    # O upload é opcional para permitir posts de texto; a resposta expõe só seu endereço.
    media_file = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Post
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "content": {"required": False, "allow_blank": True},
        }
        fields = [
            "id",
            "title",
            "category",
            "content",
            "media_type",
            "media_url",
            "media_file",
            "created_at",
            "author",
            "author_display_name",
            "author_profile",
            "is_mine",
            "likes_count",
            "comments_count",
            "liked_by_me",
        ]

    # Monta a resposta do post e apresenta o endereço do upload no campo media_url.
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["media_url"] = self.get_media_url(instance)
        return data

    # Determina o tipo da mídia enviada e limpa a URL externa quando existe um arquivo.
    def validate(self, attrs):
        media = attrs.get("media_file")
        if media:
            attrs["media_type"] = "video" if media.content_type.startswith("video/") else "image"
            attrs["media_url"] = ""
        instance = self.instance
        has_media = attrs.get("media_file", getattr(instance, "media_file", None)) or attrs.get(
            "media_url", getattr(instance, "media_url", "")
        )
        errors = {}
        for field, message in (
            ("title", "Informe o título quando não houver foto ou vídeo."),
            ("content", "Escreva o texto quando não houver foto ou vídeo."),
        ):
            value = attrs.get(field, getattr(instance, field, "")).strip()
            if not has_media and not value:
                errors[field] = message
            if instance is None or field in attrs:
                attrs[field] = value
        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    # Retorna o username do autor da publicação.
    def get_author(self, obj):
        return obj.user.username

    def get_author_display_name(self, obj):
        return user_display_name(obj.user)

    # Prioriza o arquivo enviado e mantém a URL externa para publicações antigas.
    def get_media_url(self, obj):
        if obj.media_file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.media_file.url) if request else obj.media_file.url
        return obj.media_url

    # Confere MIME, extensão, tamanho e assinatura inicial do arquivo antes de aceitar o upload.
    def validate_media_file(self, value):
        if value is None:
            return value
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime",
        }
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Envie uma imagem JPG, JPEG, JFIF, PNG, WEBP ou um vídeo MP4, WEBM ou MOV."
            )
        extensions = {
            "image/jpeg": {".jpg", ".jpeg", ".jfif"},
            "image/png": {".png"},
            "image/webp": {".webp"},
            "video/mp4": {".mp4"},
            "video/webm": {".webm"},
            "video/quicktime": {".mov"},
        }
        if Path(value.name).suffix.lower() not in extensions[value.content_type]:
            raise serializers.ValidationError(
                "A extensão do arquivo não corresponde ao formato informado."
            )
        if value.size > 20 * 1024 * 1024:
            raise serializers.ValidationError("A mídia deve ter no máximo 20 MB.")
        # Verifica a assinatura inicial além do MIME informado pelo navegador.
        header = value.read(32)
        # Reposiciona o arquivo para que o armazenamento salve também os bytes já lidos.
        value.seek(0)
        signatures = {
            "image/jpeg": header.startswith(b"\xff\xd8\xff"),
            "image/png": header.startswith(b"\x89PNG\r\n\x1a\n"),
            "image/webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
            "video/mp4": header[4:8] == b"ftyp",
            "video/quicktime": header[4:8] in (b"ftyp", b"moov", b"mdat", b"wide"),
            "video/webm": header.startswith(b"\x1a\x45\xdf\xa3"),
        }
        if not signatures[value.content_type]:
            raise serializers.ValidationError(
                "O conteúdo do arquivo não corresponde ao formato informado."
            )
        return value

    # Inclui as opções públicas do avatar e usa valores padrão quando não existe perfil.
    def get_author_profile(self, obj):
        profile = getattr(obj.user, "profile", None)
        avatar_url = ""
        if profile:
            # A foto enviada aparece no feed com URL absoluta; links antigos continuam válidos.
            avatar_url = (
                ProfileSerializer(profile, context=self.context).get_avatar_file_url(profile)
                or profile.avatar_url
            )
        return {
            "avatar_url": avatar_url,
            "avatar_choice": profile.avatar_choice if profile else "portrait01",
        }

    # Compara o usuário autenticado com o autor para indicar se a publicação pertence à sessão.
    def get_is_mine(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.user_id == user.id

    # Retorna o número de curtidas registradas para a publicação.
    def get_likes_count(self, obj):
        return obj.likes.count()

    # Retorna o número de comentários registrados para a publicação.
    def get_comments_count(self, obj):
        return obj.comments.count()

    # Indica se o usuário autenticado já curtiu esta publicação.
    def get_liked_by_me(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.likes.filter(user=user).exists()


# PERFIL: expõe dados editáveis sem permitir alteração do usuário pelo cliente.
class ProfileSerializer(serializers.ModelSerializer):
    # Identificação da conta é somente leitura; este endpoint edita apenas o perfil.
    username = serializers.CharField(source="user.username", read_only=True)
    display_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    avatar_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    avatar_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "username",
            "display_name",
            "email",
            "bio",
            "avatar_url",
            "avatar_choice",
            "avatar_file",
            "avatar_file_url",
        ]

    def get_display_name(self, obj):
        return user_display_name(obj.user)

    # Devolve o endereço completo do upload para o frontend hospedado em outro domínio.
    def get_avatar_file_url(self, obj):
        if not obj.avatar_file:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.avatar_file.url) if request else obj.avatar_file.url

    # Aceita apenas imagens de até 5 MB; extensão e assinatura devem corresponder ao MIME.
    def validate_avatar_file(self, value):
        if value is None:
            return value
        formats = {
            "image/jpeg": {".jpg", ".jpeg", ".jfif"},
            "image/png": {".png"},
            "image/webp": {".webp"},
        }
        if (
            value.content_type not in formats
            or Path(value.name).suffix.lower() not in formats[value.content_type]
        ):
            raise serializers.ValidationError("Envie uma foto JPG, JPEG, JFIF, PNG ou WEBP.")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("A foto deve ter no máximo 5 MB.")
        header = value.read(12)
        value.seek(0)
        valid = {
            "image/jpeg": header.startswith(b"\xff\xd8\xff"),
            "image/png": header.startswith(b"\x89PNG\r\n\x1a\n"),
            "image/webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
        }
        if not valid[value.content_type]:
            raise serializers.ValidationError(
                "O conteúdo do arquivo não corresponde a uma foto válida."
            )
        return value

    # A escolha mais recente define a aparência: upload, link ou ilustração.
    def validate(self, attrs):
        if attrs.get("avatar_file"):
            attrs["avatar_url"] = ""
        elif attrs.get("avatar_url"):
            attrs["avatar_file"] = None
        elif "avatar_choice" in attrs:
            attrs["avatar_file"] = None
            attrs["avatar_url"] = ""
        return attrs

    # Remove a foto substituída somente depois de a atualização do banco ser confirmada.
    def update(self, instance, validated_data):
        old_file = instance.avatar_file
        result = super().update(instance, validated_data)
        if old_file and old_file.name != result.avatar_file.name:
            transaction.on_commit(lambda: old_file.storage.delete(old_file.name))
        return result


# COMENTÁRIOS: impede que autor e postagem sejam falsificados no payload.
class PostCommentSerializer(serializers.ModelSerializer):
    # A view define o autor a partir da sessão e o post a partir da URL.
    author = serializers.CharField(source="user.username", read_only=True)
    author_display_name = serializers.SerializerMethodField()

    class Meta:
        model = PostComment
        fields = ["id", "post", "content", "author", "author_display_name", "created_at"]
        read_only_fields = ["post"]

    def get_author_display_name(self, obj):
        return user_display_name(obj.user)


# CONTEÚDO EDUCATIVO.
class ConteudoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conteudo
        fields = [
            "id",
            "titulo",
            "descricao",
            "categoria",
            "conteudo",
            "data_publicacao",
        ]


# QUIZ: perguntas.
class PerguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pergunta
        fields = [
            "id",
            "enunciado",
            "opcao_a",
            "opcao_b",
            "opcao_c",
            "alternativa_correta",
            "categoria",
            "criado_em",
        ]


# QUIZ: resultados.
class ResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultado
        fields = [
            "id",
            "nome",
            "pontuacao",
            "total_perguntas",
            "resultado",
            "respostas",
            "criado_em",
        ]


# LEGADO/USUÁRIOS.
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "nome", "email", "criado_em"]
