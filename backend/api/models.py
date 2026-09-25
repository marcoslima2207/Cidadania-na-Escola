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


class Pergunta(models.Model):
    CATEGORIAS = [
        ('democracia', 'Democracia e Cidadania'),
        ('desinformacao', 'Desinformação'),
        ('checagem', 'Checagem de Informação'),
        ('trabalhista', 'Direitos Trabalhistas'),
    ]

    enunciado = models.TextField()
    opcao_a = models.TextField()
    opcao_b = models.TextField()
    opcao_c = models.TextField()
    alternativa_correta = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C')])
    categoria = models.CharField(max_length=30, choices=CATEGORIAS)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.enunciado


class Resultado(models.Model):
    nome = models.CharField(max_length=120, blank=True, default='Anônimo')
    pontuacao = models.IntegerField(default=0)
    total_perguntas = models.IntegerField(default=0)
    resultado = models.CharField(max_length=200, blank=True, default='')
    respostas = models.JSONField(default=dict, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.nome} - {self.pontuacao}/{self.total_perguntas}'


class Usuario(models.Model):
    nome = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome