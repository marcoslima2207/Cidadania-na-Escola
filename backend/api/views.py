from django.contrib.auth import authenticate
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
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'like', 'comments']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
        return Response({'liked': created, 'likes_count': post.likes.count()})

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