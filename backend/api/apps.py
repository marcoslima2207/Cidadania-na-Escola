# Identifica o aplicativo api para que o Django encontre seus modelos e configurações.
from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'
