from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import ConteudoViewSet, PerguntaViewSet, ResultadoViewSet, UsuarioViewSet


router = DefaultRouter()

router.register(r'conteudos', ConteudoViewSet, basename='conteudo')
router.register(r'perguntas', PerguntaViewSet, basename='pergunta')
router.register(r'resultados', ResultadoViewSet, basename='resultado')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')


urlpatterns = [
    path('', include(router.urls)),
]