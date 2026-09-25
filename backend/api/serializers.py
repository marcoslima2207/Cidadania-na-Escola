from rest_framework import serializers

from .models import Conteudo, Pergunta, Resultado, Usuario


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