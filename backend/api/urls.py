from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import ConteudoViewSet


router = DefaultRouter()

router.register(r'conteudos', ConteudoViewSet, basename='conteudo')


urlpatterns = [
    path('', include(router.urls)),
]