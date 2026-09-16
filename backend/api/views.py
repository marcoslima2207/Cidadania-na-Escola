from rest_framework import viewsets

from .models import Conteudo
from .serializers import ConteudoSerializer


class ConteudoViewSet(viewsets.ModelViewSet):
    queryset = Conteudo.objects.all().order_by('-data_publicacao')
    serializer_class = ConteudoSerializer