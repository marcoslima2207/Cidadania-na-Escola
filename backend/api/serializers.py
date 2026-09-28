from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Conteudo, Pergunta, Post, PostComment, Profile, Resultado, Usuario

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        entered_value = attrs['username']

        user = None
        if '@' in entered_value:
            try:
                user = User.objects.get(email=entered_value)
            except User.DoesNotExist:
                user = None
        else:
            try:
                user = User.objects.get(username=entered_value)
            except User.DoesNotExist:
                user = None

        if not user:
            user = authenticate(username=entered_value, password=attrs['password'])

        if not user or not user.is_active:
            raise serializers.ValidationError('Credenciais inválidas.')

        if not user.check_password(attrs['password']):
            raise serializers.ValidationError('Credenciais inválidas.')

        token, _ = Token.objects.get_or_create(user=user)
        return {'token': token.key, 'user': user}


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        base_username = email.split('@')[0].lower()
        username = base_username
        suffix = 1

        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f'{base_username}{suffix}'

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data['name'][:150],
        )
        token, _ = Token.objects.get_or_create(user=user)
        return {'token': token.key, 'user': user}


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'category', 'content', 'media_type', 'media_url', 'created_at', 'author', 'likes_count', 'comments_count', 'liked_by_me']

    def get_author(self, obj):
        return obj.user.username

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_liked_by_me(self, obj):
        user = self.context['request'].user
        return user.is_authenticated and obj.likes.filter(user=user).exists()


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'bio', 'avatar_url', 'avatar_choice']


class PostCommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = PostComment
        fields = ['id', 'post', 'content', 'author', 'created_at']
        read_only_fields = ['post']


class ConteudoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conteudo
        fields = [
            'id',
            'titulo',
            'descricao',
            'categoria',
            'conteudo',
            'data_publicacao',
        ]


class PerguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pergunta
        fields = [
            'id',
            'enunciado',
            'opcao_a',
            'opcao_b',
            'opcao_c',
            'alternativa_correta',
            'categoria',
            'criado_em',
        ]


class ResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultado
        fields = [
            'id',
            'nome',
            'pontuacao',
            'total_perguntas',
            'resultado',
            'respostas',
            'criado_em',
        ]


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'criado_em']