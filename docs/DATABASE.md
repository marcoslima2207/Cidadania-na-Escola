# Documentação do Banco de Dados

## 1. Visão geral

O projeto utiliza o sistema de modelos e migrações do Django para organizar os dados da plataforma.

Existem dois ambientes principais:

- **Desenvolvimento local:** SQLite em `backend/db.sqlite3`;
- **Produção:** PostgreSQL provisionado no Render.

A estrutura do banco é definida em:

```text
backend/api/models.py
```

As alterações da estrutura são registradas em:

```text
backend/api/migrations/
```

## 2. Banco local e banco de produção

### Banco local

O banco local é um arquivo SQLite:

```text
backend/db.sqlite3
```

Ele é usado para desenvolvimento e testes manuais.

Para criar ou atualizar suas tabelas:

```bash
cd backend
python manage.py migrate
```

### Banco de produção

O ambiente online utiliza PostgreSQL no Render.

A configuração está no arquivo:

```text
render.yaml
```

O Render fornece as variáveis de conexão:

```text
DB_ENGINE=postgresql
DB_NAME=nome-do-banco
DB_USER=usuario-do-banco
DB_PASSWORD=senha-do-banco
DB_HOST=endereco-do-banco
DB_PORT=5432
```

O Django escolhe PostgreSQL quando `DB_ENGINE` possui o valor `postgresql`. Caso contrário, usa SQLite.

## 3. Tabelas principais

## 3.1 Usuário padrão do Django

O projeto utiliza o modelo de usuário padrão do Django.

Essa tabela armazena:

- nome de usuário;
- e-mail;
- senha criptografada;
- nome;
- status de ativação;
- datas de criação e alteração.

A senha nunca deve ser armazenada em texto puro. O Django salva apenas o hash da senha.

Esse usuário é usado para:

- login;
- cadastro;
- criação de posts;
- curtidas;
- comentários;
- edição do próprio perfil;
- controle de autoria.

## 3.2 Tokens de autenticação

A aplicação utiliza `rest_framework.authtoken`.

Cada usuário autenticado pode possuir um token usado nas requisições:

```http
Authorization: Token token-do-usuario
```

O token é criado no login ou no cadastro.

No logout, o token é removido do banco.

## 3.3 Profile

O modelo `Profile` representa o perfil público e personalizável de um usuário.

Campos:

| Campo | Tipo | Descrição |
|---|---|---|
| `user` | OneToOne | Usuário dono do perfil |
| `bio` | Texto curto | Descrição do usuário |
| `avatar_url` | URL | Link direto para uma imagem |
| `avatar_choice` | Texto | Avatar ilustrativo escolhido |

Avatares ilustrativos disponíveis:

```text
sun
leaf
star
book
```

O relacionamento `OneToOne` garante um perfil principal para cada usuário.

Se o perfil ainda não existir, ele é criado automaticamente durante login, cadastro ou acesso à rota de perfil.

### Foto de perfil

O campo `avatar_url` deve receber uma URL direta para uma imagem, por exemplo:

```text
https://site.com/minha-foto.jpg
```

São exemplos de extensões comuns:

```text
.jpg
.jpeg
.png
.webp
```

Links de pesquisa, como páginas do Google Imagens, não são imagens diretas e não funcionam corretamente como foto de perfil.

## 3.4 Post

O modelo `Post` representa uma publicação criada por um usuário.

Campos:

| Campo | Tipo | Descrição |
|---|---|---|
| `user` | ForeignKey | Autor da publicação |
| `title` | Texto | Título do post |
| `category` | Escolha | Categoria da publicação |
| `content` | Texto longo | Corpo da publicação |
| `media_type` | Escolha | `image` ou `video` |
| `media_url` | URL | Link da mídia, quando existir |
| `created_at` | Data/hora | Momento da criação |

Categorias aceitas:

```text
Direitos Trabalhistas
Democracia
Cidadania
Desinformação
Educação
```

Tipos de mídia aceitos:

```text
image
video
```

Cada postagem pertence a um usuário por meio de uma chave estrangeira.

Se o usuário for excluído, suas publicações também podem ser removidas conforme a regra `CASCADE` configurada no relacionamento.

## 3.5 PostLike

O modelo `PostLike` registra uma curtida.

Campos:

| Campo | Tipo | Descrição |
|---|---|---|
| `post` | ForeignKey | Publicação curtida |
| `user` | ForeignKey | Usuário que curtiu |
| `created_at` | Data/hora | Momento da curtida |

Existe uma restrição única para a combinação:

```text
post + user
```

Isso impede curtidas duplicadas do mesmo usuário no mesmo post.

O botão de curtir funciona como alternância:

- primeira ação: cria a curtida;
- segunda ação: remove a curtida.

## 3.6 PostComment

O modelo `PostComment` armazena comentários nas publicações.

Campos:

| Campo | Tipo | Descrição |
|---|---|---|
| `post` | ForeignKey | Publicação comentada |
| `user` | ForeignKey | Autor do comentário |
| `content` | Texto curto | Texto do comentário |
| `created_at` | Data/hora | Momento do comentário |

O autor e a publicação são definidos no backend. O frontend não pode escolher outro usuário para o comentário.

## 3.7 Conteudo

O modelo `Conteudo` armazena materiais educativos.

Campos:

- `titulo`;
- `descricao`;
- `categoria`;
- `conteudo`;
- `data_publicacao`.

Categorias disponíveis:

```text
democracia
desinformacao
checagem
trabalhista
```

## 3.8 Pergunta

O modelo `Pergunta` armazena perguntas do quiz.

Campos:

- `enunciado`;
- `opcao_a`;
- `opcao_b`;
- `opcao_c`;
- `alternativa_correta`;
- `categoria`;
- `criado_em`.

A alternativa correta aceita:

```text
a
b
c
```

## 3.9 Resultado

O modelo `Resultado` armazena uma tentativa do quiz.

Campos:

- `nome`;
- `pontuacao`;
- `total_perguntas`;
- `resultado`;
- `respostas`;
- `criado_em`.

O campo `respostas` é armazenado como JSON, permitindo guardar as respostas selecionadas pelo usuário.

## 3.10 Usuario

O modelo `Usuario` é um modelo auxiliar mais antigo.

Campos:

- `nome`;
- `email`;
- `criado_em`.

O sistema atual de login utiliza o modelo padrão de usuário do Django, não esse modelo auxiliar.

## 4. Relacionamentos

A estrutura principal pode ser representada assim:

```text
User
 ├── Profile                  1 para 1
 ├── Post                     1 para muitos
 ├── PostLike                 1 para muitos
 └── PostComment              1 para muitos

Post
 ├── PostLike                 1 para muitos
 └── PostComment              1 para muitos
```

Em termos práticos:

- um usuário possui um perfil;
- um usuário pode criar vários posts;
- um usuário pode curtir vários posts;
- um usuário pode escrever vários comentários;
- um post pode receber várias curtidas;
- um post pode receber vários comentários.

## 5. Migrações

As migrações registram alterações na estrutura do banco.

Principais migrações da aplicação:

```text
0001_initial.py
0003_post.py
0004_postcomment_profile_postlike.py
```

A migração `0004` criou as estruturas sociais:

- `Profile`;
- `PostLike`;
- `PostComment`.

Para aplicar todas as migrações:

```bash
python manage.py migrate
```

Para verificar migrações pendentes:

```bash
python manage.py showmigrations
```

Para gerar uma nova migração depois de alterar um modelo:

```bash
python manage.py makemigrations
```

Depois aplique:

```bash
python manage.py migrate
```

## 6. Estado atual do banco local

Após aplicar as migrações, o banco local foi consultado.

Estado atual:

```text
Usuários Django:       0
Perfis:                0
Publicações:           0
Curtidas:              0
Comentários:           0
Conteúdos:             0
Perguntas:             0
Resultados:            0
Usuários auxiliares:   0
```

Isso significa que:

- a estrutura está criada;
- as tabelas existem;
- o banco local está vazio;
- nenhum usuário local foi cadastrado ainda.

Os testes automatizados usam um banco temporário próprio e não representam necessariamente os dados permanentes do banco local.

## 7. Estado do banco de produção

O banco do Render é separado do SQLite local.

Por isso:

- usuários criados no site público ficam no PostgreSQL do Render;
- posts publicados no site público ficam no PostgreSQL do Render;
- dados criados localmente não aparecem automaticamente online;
- dados do Render não aparecem automaticamente no SQLite local.

Para conferir dados de produção, é necessário acessar o banco PostgreSQL do Render ou usar os endpoints autenticados da API.

## 8. Regras de acesso aos dados

### Dados públicos

Podem ser consultados sem login:

- listagem de conteúdos;
- listagem de perguntas;
- listagem de publicações;
- informações públicas dos posts.

### Dados protegidos

Exigem token:

- criar publicação;
- curtir;
- comentar;
- consultar o próprio perfil;
- editar o próprio perfil;
- fazer logout;
- excluir uma publicação.

A exclusão possui uma regra adicional: o usuário só pode excluir uma publicação que pertence a ele.

## 9. Consultar dados pelo Django Shell

Para abrir o shell:

```bash
cd backend
python manage.py shell
```

Exemplo de consulta de quantidades:

```python
from django.contrib.auth import get_user_model
from api.models import Post, Profile, PostLike, PostComment

User = get_user_model()

print(User.objects.count())
print(Profile.objects.count())
print(Post.objects.count())
print(PostLike.objects.count())
print(PostComment.objects.count())
```

Exemplo para listar usuários:

```python
User.objects.values('id', 'username', 'email')
```

Exemplo para listar posts:

```python
Post.objects.values('id', 'title', 'category', 'user_id')
```

Exemplo para listar comentários:

```python
PostComment.objects.values('id', 'post_id', 'user_id', 'content')
```

## 10. Comandos úteis

Verificar a configuração do Django:

```bash
python manage.py check
```

Executar os testes:

```bash
python manage.py test api.tests
```

Criar migrações:

```bash
python manage.py makemigrations
```

Aplicar migrações:

```bash
python manage.py migrate
```

Listar migrações:

```bash
python manage.py showmigrations
```

Criar um administrador:

```bash
python manage.py createsuperuser
```

Iniciar o servidor local:

```bash
python manage.py runserver
```

## 11. Melhorias futuras no banco

- adicionar upload real de fotos e vídeos;
- usar armazenamento externo para arquivos de mídia;
- configurar backups automáticos do PostgreSQL;
- adicionar recuperação de senha;
- confirmar e-mail dos usuários;
- permitir edição e exclusão dos próprios comentários;
- adicionar respostas encadeadas;
- criar notificações;
- registrar denúncias e moderação;
- adicionar índices para melhorar buscas;
- implementar paginação dos posts;
- criar relatórios administrativos;
- adicionar auditoria de alterações importantes.
