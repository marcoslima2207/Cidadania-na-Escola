# Distribui as requisições entre administração Django, endpoints da API e arquivos de mídia.
from django.contrib import admin
from django.urls import include, path

from api.views import serve_uploaded_media

urlpatterns = [
    # ADMINISTRACAO E API: endpoints principais do projeto Django.
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('media/<path:path>', serve_uploaded_media, name='uploaded-media'),
]
