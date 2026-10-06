# Documentação do Backend

## 1. Visão geral

O backend do projeto **Cidadania na Escola** é uma API REST desenvolvida com Django e Django REST Framework. Ele recebe requisições do frontend Angular, valida os dados, consulta ou altera o banco de dados e devolve respostas em JSON.

O backend é responsável por:

- cadastro e login de usuários;
- logout e controle de sessão;
- perfis personalizados;
- conteúdos educativos;
- perguntas e resultados do quiz;
- criação de publicações;
- curtidas;
- comentários;
- exclusão protegida de publicações;
- comunicação entre frontend e banco de dados.

## 2. Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `backend/config/settings.py` | Configurações do Django, banco, CORS e autenticação |
| `backend/config/urls.py` | Rotas principais do projeto |
| `backend/api/models.py` | Tabelas e relacionamentos do banco |
| `backend/api/serializers.py` | Validação e conversão dos dados para JSON |
| `backend/api/views.py` | Regras de negócio e endpoints |
| `backend/api/urls.py` | Registro das rotas REST |
| `backend/api/tests.py` | Testes automatizados da API |
| `backend/requirements.txt` | Dependências Python |
| `render.yaml` | Configuração do deploy no Render |

## 3. Entrada da aplicação

Em `backend/config/urls.py`, existem duas entradas principais:

```text
/admin/
```

Painel administrativo do Django.

```text
/api/
```

Entrada de todas as rotas REST.

A raiz pública da API é:

<https://cidadania-na-escola-api.onrender.com/api/>

## 4. Rotas disponíveis

As rotas são registradas com `DefaultRouter` em `backend/api/urls.py`:

```text
/api/auth/
/api/conteudos/
/api/perguntas/
/api/resultados/
/api/usuarios/
/api/posts/
```

O Django REST Framework cria automaticamente rotas de listagem, criação, detalhe, edição e exclusão conforme cada `ViewSet`.

## 5. Autenticação

O sistema utiliza autenticação por token com `TokenAuthentication`.

### 5.1 Login

Endpoint:

```http
POST /api/auth/login/
```

Exemplo de requisição:

```json
{
  "username": "usuario@email.com",
  "password": "12345678"
}
```

O campo `username` aceita tanto o e-mail quanto o nome de usuário.

Resposta esperada:

```json
{
  "token": "token-gerado",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@email.com"
  }
}
```

O frontend salva o token no `localStorage` com a chave:

```text
cidadania_token
```

Nas requisições protegidas, o token é enviado no cabeçalho:

```http
Authorization: Token token-gerado
```

### 5.2 Cadastro

Endpoint:

```http
POST /api/auth/register/
```

Exemplo:

```json
{
  "name": "Marcos",
  "email": "marcos@email.com",
  "password": "12345678"
}
```

O backend:

1. valida o nome;
2. valida o formato do e-mail;
3. verifica se o e-mail já está cadastrado;
4. gera um nome de usuário a partir do e-mail;
5. cria o usuário Django;
6. cria o perfil relacionado;
7. gera o token;
8. autentica o usuário automaticamente.

A senha precisa ter pelo menos 8 caracteres.

### 5.3 Logout

Endpoint:

```http
POST /api/auth/logout/
Authorization: Token token-do-usuario
```

O backend apaga o token do usuário. O frontend também remove o token armazenado no navegador.

## 6. Perfil do usuário

O perfil usa uma relação `OneToOne` com o usuário Django.

### Consultar perfil

```http
GET /api/auth/profile/
Authorization: Token token-do-usuario
```

### Editar perfil

```http
PATCH /api/auth/profile/
Authorization: Token token-do-usuario
```

Exemplo:

```json
{
  "bio": "Estudante e participante da comunidade",
  "avatar_url": "https://site.com/foto.jpg",
  "avatar_choice": "sun"
}
```

Os avatares ilustrativos disponíveis são:

```text
sun
leaf
star
book
```

O perfil permite personalizar:

- biografia;
- foto por URL direta;
- avatar ilustrativo.

A URL da foto precisa apontar diretamente para uma imagem, como `.jpg`, `.png`, `.jpeg` ou `.webp`. Links de pesquisa do Google não funcionam como imagem de perfil.

## 7. Modelos do banco de dados

Os modelos ficam em `backend/api/models.py`.

### 7.1 Post

Representa uma publicação feita por um usuário.

Campos principais:

- usuário autor;
- título;
- categoria;
- texto;
- tipo de mídia;
- URL da mídia;
- data de criação.

### 7.2 Profile

Representa o perfil personalizado do usuário.

Campos:

- usuário relacionado;
- biografia;
- URL da foto;
- avatar ilustrativo.

### 7.3 PostLike

Registra uma curtida em uma publicação.

Existe uma restrição para impedir que o mesmo usuário curta a mesma postagem várias vezes. Ao clicar novamente, a curtida é removida.

### 7.4 PostComment

Representa um comentário associado a:

- uma publicação;
- um usuário;
- um texto;
- uma data de criação.

### 7.5 Conteudo

Armazena materiais educativos organizados por categoria.

### 7.6 Pergunta

Armazena perguntas de múltipla escolha do quiz.

### 7.7 Resultado

Armazena o resultado de uma tentativa do quiz.

### 7.8 Usuario

É um modelo auxiliar mais antigo mantido no projeto. O login atual utiliza o modelo padrão de usuário do Django.

## 8. Publicações

A leitura das publicações é pública:

```http
GET /api/posts/
```

Para criar uma publicação, é necessário estar autenticado:

```http
POST /api/posts/
Authorization: Token token-do-usuario
```

Exemplo:

```json
{
  "title": "Participação cidadã",
  "category": "Cidadania",
  "content": "Participar também é transformar.",
  "media_type": "image",
  "media_url": "https://site.com/imagem.jpg"
}
```

Os tipos de mídia aceitos são:

```text
image
video
```

## 9. Curtidas

Endpoint:

```http
POST /api/posts/1/like/
Authorization: Token token-do-usuario
```

O comportamento é alternado:

- se o usuário ainda não curtiu, a curtida é criada;
- se já curtiu, a curtida é removida.

Resposta:

```json
{
  "liked": true,
  "likes_count": 1
}
```

Cada publicação também informa:

- quantidade de curtidas;
- quantidade de comentários;
- se o usuário atual já curtiu;
- se a publicação pertence ao usuário atual;
- perfil e avatar do autor.

## 10. Comentários

A criação de comentários exige autenticação.

### Listar comentários

```http
GET /api/posts/1/comments/
Authorization: Token token-do-usuario
```

### Criar comentário

```http
POST /api/posts/1/comments/
Authorization: Token token-do-usuario
```

Exemplo:

```json
{
  "content": "Concordo com essa publicação!"
}
```

O autor e a publicação são definidos pelo backend. O cliente não pode falsificar esses dados.

## 11. Exclusão de publicações

Endpoint:

```http
DELETE /api/posts/1/
Authorization: Token token-do-usuario
```

O backend verifica se o usuário autenticado é o dono da publicação. Caso não seja, retorna erro `403 Forbidden` e mantém a publicação no banco.

Essa proteção existe no backend, portanto não depende apenas do botão exibido no frontend.

## 12. Serializers

Os serializers ficam em `backend/api/serializers.py`.

Eles são responsáveis por:

- validar dados recebidos;
- transformar modelos Django em JSON;
- transformar JSON em objetos Django;
- esconder campos que não devem ser alterados pelo cliente;
- incluir informações calculadas, como contadores de curtidas.

Principais serializers:

- `LoginSerializer`;
- `RegisterSerializer`;
- `PostSerializer`;
- `ProfileSerializer`;
- `PostCommentSerializer`;
- `ConteudoSerializer`;
- `PerguntaSerializer`;
- `ResultadoSerializer`;
- `UsuarioSerializer`.

## 13. Permissões

O backend possui dois comportamentos principais:

### Rotas públicas

Podem ser acessadas sem login:

- listagem de conteúdos;
- perguntas;
- resultados, conforme a configuração atual;
- listagem de posts;
- páginas públicas da API.

### Rotas protegidas

Exigem token:

- criação de post;
- curtidas;
- comentários;
- edição de perfil;
- consulta do próprio perfil;
- logout;
- exclusão de post.

## 14. Banco de dados

Localmente, o projeto pode utilizar SQLite:

```text
backend/db.sqlite3
```

Em produção, o `render.yaml` configura PostgreSQL.

As migrações são executadas com:

```bash
python manage.py migrate
```

No Render, o comando de build executa:

```bash
pip install -r requirements.txt && python manage.py migrate
```

## 15. Configuração de produção

O backend usa variáveis de ambiente:

```text
DJANGO_SECRET_KEY=chave-secreta
DEBUG=False
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://marcoslima2207.github.io
```

Para PostgreSQL:

```text
DB_ENGINE=postgresql
DB_NAME=nome-do-banco
DB_USER=usuario-do-banco
DB_PASSWORD=senha-do-banco
DB_HOST=endereco-do-banco
DB_PORT=5432
```

O CORS permite que o frontend publicado no GitHub Pages acesse a API do Render.

## 16. Deploy

O backend é executado no Render com Gunicorn:

```bash
gunicorn config.wsgi:application
```

O frontend é publicado no GitHub Pages.

Fluxo da aplicação:

```text
Usuário
  ↓
Angular no GitHub Pages
  ↓ HTTP/JSON
Django REST no Render
  ↓ Django ORM
PostgreSQL
```

Arquivos relacionados ao deploy:

- `render.yaml`: serviço Django e banco PostgreSQL;
- `.github/workflows/deploy-pages.yml`: build e publicação do Angular;
- `frontend/src/app/api-config.ts`: API local;
- `frontend/src/app/api-config.prod.ts`: API de produção.

## 17. Execução local

### Backend

```bash
cd backend
python -m venv .venv
```

No Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Depois:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

A API local ficará disponível em:

```text
http://localhost:8000/api/
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

O site local ficará disponível em:

```text
http://localhost:4200/
```

## 18. Testes

Os testes ficam em `backend/api/tests.py`.

Para executar:

```bash
cd backend
python manage.py test api.tests
```

A suíte cobre:

- listagem de conteúdos;
- criação de conteúdos;
- listagem de perguntas;
- criação de resultados;
- login;
- cadastro;
- publicação autenticada;
- curtidas;
- comentários;
- bloqueio de exclusão de posts de outros usuários.

Para validar o frontend:

```bash
cd frontend
npm run build
```

## 19. Melhorias futuras

- upload real de fotos e vídeos, sem depender de URLs externas;
- armazenamento permanente em PostgreSQL com backups;
- recuperação de senha por e-mail;
- confirmação de e-mail no cadastro;
- edição e exclusão de comentários próprios;
- respostas encadeadas aos comentários;
- notificações de curtidas e comentários;
- busca e filtros por categoria;
- paginação das postagens;
- carregamento progressivo do feed;
- moderação e denúncia de conteúdo;
- painel administrativo para professores e equipe;
- testes end-to-end para login e publicação;
- melhorias adicionais de acessibilidade;
- suporte multilíngue.

## 20. Links públicos

Site:

<https://marcoslima2207.github.io/Cidadania-na-Escola/>

API:

<https://cidadania-na-escola-api.onrender.com/api/>
