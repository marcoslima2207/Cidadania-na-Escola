from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Conteudo, Pergunta, Post, Resultado, Usuario

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


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'category', 'content', 'media_type', 'media_url', 'created_at', 'author']

    def get_author(self, obj):
        return obj.user.username


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