from rest_framework import serializers

from .models import Nivel, Tema


class TemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tema
        fields = ["id", "nome", "slug", "descricao", "icone"]


class NivelSerializer(serializers.ModelSerializer):
    tema = TemaSerializer(read_only=True)
    total_perguntas = serializers.IntegerField(read_only=True)

    class Meta:
        model = Nivel
        fields = ["id", "titulo", "ordem", "tema", "total_perguntas"]


class RespostaSerializer(serializers.Serializer):
    pergunta_id = serializers.IntegerField(min_value=1)
    alternativa = serializers.ChoiceField(choices=["a", "b", "c"])


class PerguntaGeradaSerializer(serializers.Serializer):
    enunciado = serializers.CharField(min_length=15, max_length=1000)
    opcao_a = serializers.CharField(max_length=400)
    opcao_b = serializers.CharField(max_length=400)
    opcao_c = serializers.CharField(max_length=400)
    alternativa_correta = serializers.ChoiceField(choices=["a", "b", "c"])
    categoria = serializers.ChoiceField(
        choices=["cidadania", "democracia", "desinformacao", "checagem", "trabalhista", "educacao"]
    )
    explicacao = serializers.CharField(min_length=10, max_length=1200)

    def validate(self, attrs):
        options = [attrs[f"opcao_{letter}"].casefold() for letter in "abc"]
        if len(set(options)) != 3:
            raise serializers.ValidationError("As alternativas precisam ser diferentes.")
        return attrs
