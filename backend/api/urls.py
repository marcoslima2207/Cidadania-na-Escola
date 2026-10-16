# Registra os ViewSets no roteador do DRF, que gera as URLs das operações e ações.
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .quiz_views import NivelViewSet, QuizViewSet, TemaViewSet, TentativaViewSet
from .views import (
    AuthViewSet,
    ConteudoViewSet,
    PerguntaViewSet,
    PostViewSet,
    ResultadoViewSet,
    UsuarioViewSet,
)

router = DefaultRouter()

# ROTAS DA API: o router gera listagem, detalhe e ações customizadas.
router.register(r"auth", AuthViewSet, basename="auth")
router.register(r"conteudos", ConteudoViewSet, basename="conteudo")
router.register(r"perguntas", PerguntaViewSet, basename="pergunta")
router.register(r"resultados", ResultadoViewSet, basename="resultado")
router.register(r"usuarios", UsuarioViewSet, basename="usuario")
router.register(r"posts", PostViewSet, basename="post")
router.register(r"quiz/temas", TemaViewSet, basename="quiz-tema")
router.register(r"quiz/nivel", NivelViewSet, basename="quiz-nivel")
router.register(r"quiz/tentativas", TentativaViewSet, basename="quiz-tentativa")
router.register(r"quiz", QuizViewSet, basename="quiz")


urlpatterns = [
    path("", include(router.urls)),
]
