from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    # ADMINISTRACAO E API: endpoints principais do projeto Django.
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]