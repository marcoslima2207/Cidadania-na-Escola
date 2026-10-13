from pathlib import Path
import unicodedata
import mimetypes
import re

from django.conf import settings
from django.contrib.auth import authenticate
from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Conteudo, Pergunta, Post, PostComment, PostLike, Profile, Resultado, Usuario
from .serializers import (
    ConteudoSerializer,
    LoginSerializer,
    RegisterSerializer,
    PerguntaSerializer,
    PostSerializer,
    PostCommentSerializer,
    ProfileSerializer,
    ResultadoSerializer,
    UsuarioSerializer,
)


# MIDIA: serve arquivos enviados sem permitir acesso fora de MEDIA_ROOT.
def serve_uploaded_media(request, path):
    media_root = Path(settings.MEDIA_ROOT).resolve()
    requested_file = (media_root / path).resolve()
    if media_root not in requested_file.parents or not requested_file.is_file():
        raise Http404
    size = requested_file.stat().st_size
    range_header = request.headers.get('Range')
    if range_header:
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', range_header)
        if not match or not any(match.groups()):
            return HttpResponse(status=416, headers={'Content-Range': f'bytes */{size}'})
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start >= size or start > end:
            return HttpResponse(status=416, headers={'Content-Range': f'bytes */{size}'})

        def chunks():
            with requested_file.open('rb') as stream:
                stream.seek(start)
                remaining = end - start + 1
                while remaining:
                    chunk = stream.read(min(64 * 1024, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        response = StreamingHttpResponse(chunks(), status=206, content_type=mimetypes.guess_type(requested_file.name)[0] or 'application/octet-stream')
        response['Content-Range'] = f'bytes {start}-{end}/{size}'
        response['Content-Length'] = end - start + 1
    else:
        response = FileResponse(requested_file.open('rb'))
    response['Accept-Ranges'] = 'bytes'
    return response


# AUTENTICAÇÃO: login, logout e perfil do usuário atual.
class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        Profile.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})

    @action(detail=False, methods=['post'], url_path='logout', permission_classes=[IsAuthenticated])
    def logout(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get', 'patch'], url_path='profile', permission_classes=[IsAuthenticated])
    def profile(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        if request.method == 'PATCH':
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(ProfileSerializer(profile).data)

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        user = result['user']
        Profile.objects.get_or_create(user=user)
        return Response(
            {'token': result['token'], 'user': {'id': user.id, 'username': user.username, 'email': user.email}},
            status=status.HTTP_201_CREATED,
        )


# POSTAGENS: leitura pública; criação, interação e exclusão exigem token.
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related('user', 'user__profile').prefetch_related('likes', 'comments').order_by('-created_at', '-id')
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action == 'comments' and self.request.method == 'GET':
            return [AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'like', 'comments']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            term = self.request.query_params.get('search', '').strip()
            category = self.request.query_params.get('category', '').strip()
            if term:
                def normalize(value):
                    return ''.join(c for c in unicodedata.normalize('NFD', value.casefold()) if not unicodedata.combining(c))
                normalized_term = normalize(term)
                matching_ids = [
                    row['id'] for row in queryset.values('id', 'title', 'content', 'category')
                    if normalized_term in normalize(' '.join([row['title'], row['content'], row['category']]))
                ]
                queryset = queryset.filter(id__in=matching_ids)
            if category:
                queryset = queryset.filter(category=category)
        return queryset

    def perform_update(self, serializer):
        if serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied('Você só pode editar as suas próprias publicações.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise PermissionDenied('Você só pode excluir as suas próprias publicações.')
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = PostLike.objects.get_or_create(post=post, user=request.user)
        if not created:
            like.delete()
        return Response({'liked': created, 'likes_count': PostLike.objects.filter(post=post).count()})

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def comments(self, request, pk=None):
        post = self.get_object()
        if request.method == 'POST':
            serializer = PostCommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            comment = serializer.save(post=post, user=request.user)
            return Response(PostCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        return Response(PostCommentSerializer(post.comments.select_related('user').order_by('created_at'), many=True).data)


# CONTEÚDO EDUCATIVO.
class ConteudoViewSet(viewsets.ModelViewSet):
    queryset = Conteudo.objects.all().order_by('-data_publicacao')
    serializer_class = ConteudoSerializer


# QUIZ: banco de perguntas.
class PerguntaViewSet(viewsets.ModelViewSet):
    queryset = Pergunta.objects.all().order_by('id')
    serializer_class = PerguntaSerializer


# QUIZ: resultados enviados pelo frontend.
class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all().order_by('-criado_em')
    serializer_class = ResultadoSerializer


# LEGADO/USUÁRIOS.
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('id')
    serializer_class = UsuarioSerializer
