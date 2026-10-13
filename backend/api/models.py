# Define as tabelas do projeto, seus campos e os relacionamentos entre usuários, posts e quiz.
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model


# POSTAGENS: conteúdo publicado pelos usuários.
class Post(models.Model):
    # Opções aceitas para classificar uma publicação; cada par guarda valor e rótulo.
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

    # Cada post pertence a um usuário; excluir esse usuário remove seus posts do banco.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    # Campos de texto e assunto exibidos no feed e pesquisados pela busca.
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    content = models.TextField()
    # O tipo indica se o frontend deve usar uma imagem ou um reprodutor de vídeo.
    media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES, default='image')
    # Mantém compatibilidade com posts antigos que guardavam apenas o link da mídia.
    media_url = models.URLField(blank=True, default='')
    # O banco guarda o caminho; os bytes ficam em MEDIA_ROOT, organizados por ano e mês.
    media_file = models.FileField(upload_to='posts/%Y/%m/', blank=True, null=True)
    # Preenchido automaticamente no momento do cadastro, usado para ordenar o feed.
    created_at = models.DateTimeField(auto_now_add=True)

    # Define o texto usado para identificar este registro em listagens e no painel administrativo.
    def __str__(self):
        return self.title


# PERFIL: preferências públicas e avatar do usuário.
class Profile(models.Model):
    # Ilustrações fornecidas pelo projeto e publicadas junto aos arquivos do frontend.
    AVATAR_CHOICES = [
        ('portrait01', 'Óculos e cabelo ondulado'),
        ('portrait02', 'Fones de ouvido'),
        ('portrait03', 'Lenço azul'),
        ('portrait04', 'Boné'),
        ('portrait05', 'Cabelo ruivo'),
        ('portrait06', 'Cabelo curto'),
        ('portrait07', 'Tranças e óculos'),
        ('portrait08', 'Cabelo cacheado'),
    ]

    # A relação um-para-um garante um único perfil por usuário.
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    # Personalização pública que pode ser editada pela tela de perfil.
    bio = models.CharField(max_length=240, blank=True)
    avatar_url = models.URLField(blank=True)
    # A foto enviada fica no armazenamento de mídia; o banco guarda seu caminho.
    avatar_file = models.FileField(upload_to='avatars/%Y/%m/', blank=True, null=True)
    avatar_choice = models.CharField(max_length=20, choices=AVATAR_CHOICES, default='portrait01')

    # Define o texto usado para identificar este registro em listagens e no painel administrativo.
    def __str__(self):
        return f'Perfil de {self.user.username}'


# INTERAÇÕES: registro único de curtida por usuário e postagem.
class PostLike(models.Model):
    # Liga uma pessoa a um post e permite consultar as curtidas pelos dois lados.
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A regra no banco impede duas curtidas da mesma pessoa no mesmo post.
        constraints = [models.UniqueConstraint(fields=['post', 'user'], name='unique_post_like')]


# INTERAÇÕES: comentários vinculados a uma postagem e a um autor.
class PostComment(models.Model):
    # Excluir o post ou o autor também remove seus comentários relacionados no banco.
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    # Limite usado também pelo campo de comentário da interface.
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)


# CONTEÚDO EDUCATIVO: materiais organizados por tema.
class Conteudo(models.Model):
    # Códigos de categoria usados pelos endpoints de conteúdos educativos.
    CATEGORIAS = [
        ('democracia', 'Democracia e Cidadania'),
        ('desinformacao', 'Desinformação'),
        ('checagem', 'Checagem de Informação'),
        ('trabalhista', 'Direitos Trabalhistas'),
    ]

    # Título e resumo identificam o material; conteudo guarda o texto completo.
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categoria = models.CharField(max_length=30, choices=CATEGORIAS)
    conteudo = models.TextField()
    data_publicacao = models.DateTimeField(auto_now_add=True)

    # Define o texto usado para identificar este registro em listagens e no painel administrativo.
    def __str__(self):
        return self.titulo


# QUIZ: perguntas de múltipla escolha usadas pela API.
class Pergunta(models.Model):
    # As categorias compartilham a organização dos conteúdos educativos.
    CATEGORIAS = [
        ('democracia', 'Democracia e Cidadania'),
        ('desinformacao', 'Desinformação'),
        ('checagem', 'Checagem de Informação'),
        ('trabalhista', 'Direitos Trabalhistas'),
    ]

    # Cada pergunta tem três alternativas e guarda a letra da resposta correta.
    enunciado = models.TextField()
    opcao_a = models.TextField()
    opcao_b = models.TextField()
    opcao_c = models.TextField()
    alternativa_correta = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C')])
    categoria = models.CharField(max_length=30, choices=CATEGORIAS)
    criado_em = models.DateTimeField(auto_now_add=True)

    # Define o texto usado para identificar este registro em listagens e no painel administrativo.
    def __str__(self):
        return self.enunciado


# QUIZ: resultados registrados após uma tentativa.
class Resultado(models.Model):
    # Resumo de uma tentativa: participante, acertos, quantidade de perguntas e avaliação.
    nome = models.CharField(max_length=120, blank=True, default='Anônimo')
    pontuacao = models.IntegerField(default=0)
    total_perguntas = models.IntegerField(default=0)
    resultado = models.CharField(max_length=200, blank=True, default='')
    # Dicionário de respostas: default=dict cria um objeto independente por registro.
    respostas = models.JSONField(default=dict, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    # Define o texto usado para identificar este registro em listagens e no painel administrativo.
    def __str__(self):
        return f'{self.nome} - {self.pontuacao}/{self.total_perguntas}'


# LEGADO/USUÁRIOS: modelo público auxiliar mantido pela API.
class Usuario(models.Model):
    # Cadastro auxiliar legado; o login usa AUTH_USER_MODEL, não esta tabela.
    nome = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    # Define o texto usado para identificar este registro em listagens e no painel administrativo.
    def __str__(self):
        return self.nome
