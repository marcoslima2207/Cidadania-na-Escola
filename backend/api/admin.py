from django.contrib import admin

from .models import Nivel, Pergunta, ProgressoUsuario, QuizDiario, Tema, TentativaQuiz

admin.site.register([Tema, Nivel, Pergunta, ProgressoUsuario, QuizDiario, TentativaQuiz])
