from rest_framework import viewsets

from .models import Conteudo, Pergunta, Resultado, Usuario
from .serializers import (
    ConteudoSerializer,
    PerguntaSerializer,
    ResultadoSerializer,
    UsuarioSerializer,
)


class ConteudoViewSet(viewsets.ModelViewSet):
    queryset = Conteudo.objects.all().order_by('-data_publicacao')
    serializer_class = ConteudoSerializer


class PerguntaViewSet(viewsets.ModelViewSet):
    queryset = Pergunta.objects.all().order_by('id')
    serializer_class = PerguntaSerializer


class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all().order_by('-criado_em')
    serializer_class = ResultadoSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('id')
    serializer_class = UsuarioSerializer