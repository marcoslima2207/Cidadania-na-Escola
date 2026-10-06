from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model


# POSTAGENS: conteúdo publicado pelos usuários.
class Post(models.Model):
    CATEGORY_CHOICES = [
        ('Direitos Trabalhistas', 'Direitos Trabalhistas'),
        ('Democracia', 'Democracia'),
        ('Cidadania', 'Cidadania'),
        ('Desinformação', 'Desinformação'),
        ('Educação', 'Educação'),
    ]

    MEDIA_CHOICES = [
        ('image', 'Foto'),
        ('video', 'Vídeo'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    content = models.TextField()
    media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES, default='image')
    media_url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# PERFIL: preferências públicas e avatar do usuário.
class Profile(models.Model):
    AVATAR_CHOICES = [
        ('sun', 'Sol'),
        ('leaf', 'Folha'),
        ('star', 'Estrela'),
        ('book', 'Livro'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    bio = models.CharField(max_length=240, blank=True)
    avatar_url = models.URLField(blank=True)
    avatar_choice = models.CharField(max_length=20, choices=AVATAR_CHOICES, default='sun')

    def __str__(self):
        return f'Perfil de {self.user.username}'


# INTERAÇÕES: registro único de curtida por usuário e postagem.
class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['post', 'user'], name='unique_post_like')]


# INTERAÇÕES: comentários vinculados a uma postagem e a um autor.
class PostComment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)


# CONTEÚDO EDUCATIVO: materiais organizados por tema.
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


# QUIZ: perguntas de múltipla escolha usadas pela API.
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


# QUIZ: resultados registrados após uma tentativa.
class Resultado(models.Model):
    nome = models.CharField(max_length=120, blank=True, default='Anônimo')
    pontuacao = models.IntegerField(default=0)
    total_perguntas = models.IntegerField(default=0)
    resultado = models.CharField(max_length=200, blank=True, default='')
    respostas = models.JSONField(default=dict, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.nome} - {self.pontuacao}/{self.total_perguntas}'


# LEGADO/USUÁRIOS: modelo público auxiliar mantido pela API.
class Usuario(models.Model):
    nome = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome