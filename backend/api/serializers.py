from rest_framework import serializers

from .models import Conteudo


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