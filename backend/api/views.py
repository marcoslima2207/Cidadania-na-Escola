# Implementa os endpoints da API, as permissões de escrita, a busca e o envio de mídia.
import mimetypes
import re
import unicodedata
from pathlib import Path

from django.conf import settings
from django.db.models import Exists, OuterRef
from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .google_auth import GoogleCredentialSerializer, google_config
from .user_display import user_display_name
from .models import (
    Conteudo,
    Pergunta,
    Post,
    PostLike,
    PostFavorite,
    Profile,
    Resultado,
    Usuario,
)
from .serializers import (
    ConteudoSerializer,
    LoginSerializer,
    PerguntaSerializer,
    PostCommentSerializer,
    PostSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ResultadoSerializer,
    UsuarioSerializer,
)


def auth_response(user):
    token, _ = Token.objects.get_or_create(user=user)
    Profile.objects.get_or_create(user=user)
    return {
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user_display_name(user),
            "email": user.email,
        },
    }


def serve_profile_avatar(request, key):
    image = Profile.objects.filter(avatar_key=key).values_list("avatar_image", flat=True).first()
    if not image:
        raise Http404
    response = HttpResponse(bytes(image), content_type="image/webp")
    response["Cache-Control"] = "public, max-age=300"
    response["X-Content-Type-Options"] = "nosniff"
    return response


# MIDIA: serve arquivos enviados sem permitir acesso fora de MEDIA_ROOT.
# Entrega arquivos dentro de MEDIA_ROOT e atende pedidos parciais de bytes dos vídeos.
def serve_uploaded_media(request, path):
    # Resolve o caminho completo antes de abrir o arquivo para bloquear saída da pasta de mídia.
    media_root = Path(settings.MEDIA_ROOT).resolve()
    requested_file = (media_root / path).resolve()
    if media_root not in requested_file.parents or not requested_file.is_file():
        raise Http404
    size = requested_file.stat().st_size
    # Navegadores usam Range para carregar partes do vídeo e avançar na reprodução.
    range_header = request.headers.get("Range")
    if range_header:
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header)
        if not match or not any(match.groups()):
            return HttpResponse(status=416, headers={"Content-Range": f"bytes */{size}"})
        # Aceita início/fim, trecho até o final ou os últimos N bytes do arquivo.
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start >= size or start > end:
            return HttpResponse(status=416, headers={"Content-Range": f"bytes */{size}"})

        # Lê somente o trecho solicitado em blocos de até 64 KB e fecha o arquivo ao terminar.
        def chunks():
            with requested_file.open("rb") as stream:
                stream.seek(start)
                remaining = end - start + 1
                while remaining:
                    chunk = stream.read(min(64 * 1024, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        # 206 indica conteúdo parcial; Content-Range informa qual trecho foi entregue.
        response = StreamingHttpResponse(
            chunks(),
            status=206,
            content_type=mimetypes.guess_type(requested_file.name)[0] or "application/octet-stream",
        )
        response["Content-Range"] = f"bytes {start}-{end}/{size}"
        response["Content-Length"] = end - start + 1
    else:
        response = FileResponse(requested_file.open("rb"))
    response["Accept-Ranges"] = "bytes"
    return response


# AUTENTICAÇÃO: login, logout e perfil do usuário atual.
class AuthViewSet(viewsets.ViewSet):
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not settings.LEGACY_AUTH_ENABLED and self.action in ['login', 'register', 'google']:
            raise PermissionDenied('Use a nova tela de acesso para entrar na sua conta.')

    @action(detail=False, methods=["get"], url_path="google-config")
    def google_config(self, request):
        return Response(google_config())

    @action(detail=False, methods=["post"], url_path="google")
    def google(self, request):
        serializer = GoogleCredentialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(auth_response(serializer.save()))

    @action(detail=False, methods=["post"], url_path="login")
    # Valida as credenciais, garante o perfil e devolve token e dados básicos do usuário.
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(auth_response(user))

    @action(detail=False, methods=["post"], url_path="logout", permission_classes=[IsAuthenticated])
    # Apaga o token do usuário autenticado para impedir seu uso em novas requisições.
    def logout(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["get", "patch"],
        url_path="profile",
        permission_classes=[IsAuthenticated],
    )
    # Consulta o perfil atual ou valida e salva seus campos editáveis em uma requisição PATCH.
    def profile(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        if request.method == "PATCH":
            serializer = ProfileSerializer(
                profile, data=request.data, partial=True, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(ProfileSerializer(profile, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="register")
    # Valida o cadastro, cria usuário e perfil e retorna a sessão inicial com status 201.
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            auth_response(user),
            status=status.HTTP_201_CREATED,
        )


# POSTAGENS: leitura pública; criação, interação e exclusão exigem token.
class PostViewSet(viewsets.ModelViewSet):
    # Carrega autor, perfil e interações junto aos posts para reduzir consultas repetidas.
    queryset = (
        Post.objects.select_related("user", "user__profile")
        .defer("user__profile__avatar_image").prefetch_related("likes", "comments")
        .order_by("-created_at", "-id")
    )
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    # Permite leitura pública e exige autenticação nas ações que modificam a comunidade.
    def get_permissions(self):
        if self.action == "comments" and self.request.method == "GET":
            return [AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy", "like", "favorite", "comments"]:
            return [IsAuthenticated()]
        return [AllowAny()]

    # Associa o novo post ao usuário da requisição, sem aceitar um autor fornecido pelo cliente.
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Aplica os filtros de palavra e categoria apenas à listagem de posts.
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.annotate(
                saved_by_me=Exists(PostFavorite.objects.filter(post_id=OuterRef("pk"), user=user)),
            )
        if self.action == "list":
            scope = self.request.query_params.get("lista")
            if scope in ("minhas", "favoritos"):
                if not user.is_authenticated:
                    raise NotAuthenticated()
                queryset = queryset.filter(user=user) if scope == "minhas" else queryset.filter(saved_by_me=True)
            term = self.request.query_params.get("search", "").strip()
            category = self.request.query_params.get("category", "").strip()
            if category:
                queryset = queryset.filter(category=category)
            if term:
                # Remove diferenças de acentos e de maiúsculas para comparar termos da busca.
                def normalize(value):
                    return "".join(
                        c
                        for c in unicodedata.normalize("NFD", value.casefold())
                        if not unicodedata.combining(c)
                    )

                normalized_term = normalize(term)
                # Compara os textos normalizados no Python, incluindo bancos sem busca sem acentos.
                matching_ids = [
                    row["id"]
                    for row in queryset.values("id", "title", "content", "category")
                    if normalized_term
                    in normalize(" ".join([row["title"], row["content"], row["category"]]))
                ]
                queryset = queryset.filter(id__in=matching_ids)
        return queryset

    # Recusa alterações de outro autor e salva apenas as atualizações permitidas.
    def perform_update(self, serializer):
        if serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied("Você só pode editar as suas próprias publicações.")
        serializer.save()

    # Recusa a exclusão de outro autor e apaga o registro quando a autoria é confirmada.
    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise PermissionDenied("Você só pode excluir as suas próprias publicações.")
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    # Cria ou remove a curtida do usuário e consulta a contagem atualizada no banco.
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = PostLike.objects.get_or_create(post=post, user=request.user)
        if not created:
            like.delete()
        return Response(
            {"liked": created, "likes_count": PostLike.objects.filter(post=post).count()}
        )

    @action(detail=True, methods=["put", "delete"])
    def favorite(self, request, pk=None):
        post = self.get_object()
        if request.method == "PUT":
            PostFavorite.objects.get_or_create(post=post, user=request.user)
        else:
            PostFavorite.objects.filter(post=post, user=request.user).delete()
        return Response({"saved_by_me": request.method == "PUT"})

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    # Lista os comentários do post ou cria um comentário associado ao autor da requisição.
    def comments(self, request, pk=None):
        post = self.get_object()
        if request.method == "POST":
            serializer = PostCommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            comment = serializer.save(post=post, user=request.user)
            return Response(PostCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        return Response(
            PostCommentSerializer(
                post.comments.select_related("user").order_by("created_at"), many=True
            ).data
        )


# CONTEÚDO EDUCATIVO.
class ConteudoViewSet(viewsets.ModelViewSet):
    queryset = Conteudo.objects.all().order_by("-data_publicacao")
    serializer_class = ConteudoSerializer


# QUIZ: banco de perguntas.
class PerguntaViewSet(viewsets.ModelViewSet):
    queryset = Pergunta.objects.filter(nivel__isnull=True).order_by("id")
    serializer_class = PerguntaSerializer


# QUIZ: resultados enviados pelo frontend.
class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all().order_by("-criado_em")
    serializer_class = ResultadoSerializer


# LEGADO/USUÁRIOS.
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by("id")
    serializer_class = UsuarioSerializer
