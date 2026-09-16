from django.db import models


class Conteudo(models.Model):
    CATEGORIAS = [
        ('democracia', 'Democracia e Cidadania'),
        ('desinformacao', 'Desinformação'),
        ('checagem', 'Checagem de Informação'),
        ('trabalhista', 'Direitos Trabalhistas'),
    ]

    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categoria = models.CharField(max_length=30, choices=CATEGORIAS)
    conteudo = models.TextField()
    data_publicacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo