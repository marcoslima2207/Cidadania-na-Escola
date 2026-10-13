<div align="center">

# 🏛️ Cidadania na Escola

### Informação de qualidade. Cidadania mais forte.

Projeto de extensão universitária voltado à educação para a cidadania, democracia, combate à desinformação e conhecimento sobre direitos trabalhistas.

<br>

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Projeto](https://img.shields.io/badge/projeto-extensão%20universitária-153E79)
![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/Django%20REST%20Framework-A30000?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

</div>

---
[link para ver como está ficando](https://marcoslima2207.github.io/Cidadania-na-Escola/)

## 📚 Sobre o projeto

**Cidadania na Escola: informação de qualidade também é conquista** é um projeto de extensão universitária desenvolvido com o objetivo de aproximar conhecimentos relacionados à **cidadania, democracia, combate à desinformação e direitos trabalhistas** da comunidade escolar.

A proposta busca utilizar a tecnologia como ferramenta de educação e conscientização, disponibilizando conteúdos de forma simples, acessível e organizada.

O projeto também possui como público importante os estudantes da **Educação de Jovens e Adultos (EJA)**, buscando contribuir para o acesso à informação de qualidade e para o conhecimento sobre direitos e deveres na sociedade.

---

## 🎯 Objetivos

### Objetivo geral

Desenvolver uma plataforma educativa que contribua para a formação cidadã por meio do acesso a informações confiáveis sobre democracia, cidadania, desinformação e direitos trabalhistas.

### Objetivos específicos

- 📖 Disponibilizar conteúdos educativos sobre cidadania;
- 🏛️ Explicar conceitos relacionados à democracia;
- 🔎 Incentivar a verificação de informações;
- 📰 Conscientizar sobre os impactos da desinformação e das fake news;
- ⚖️ Apresentar informações introdutórias sobre direitos trabalhistas;
- 🧠 Criar atividades interativas para auxiliar no aprendizado;
- 💻 Utilizar a tecnologia como ferramenta de educação;
- 🤝 Contribuir para a formação cidadã dos estudantes da EJA.

---

# 🌐 Plataforma

A plataforma será desenvolvida como uma aplicação web, permitindo que os usuários encontrem conteúdos educativos organizados por temas.

### Principais áreas planejadas

| Área | Descrição |
|---|---|
| 🏠 Início | Apresentação do projeto e principais conteúdos |
| 🏛️ Democracia | Conteúdos sobre democracia e participação cidadã |
| 📰 Desinformação | Informações sobre fake news e seus impactos |
| 🔎 Checagem | Orientações para verificar informações |
| ⚖️ Direitos Trabalhistas | Conteúdos introdutórios sobre legislação trabalhista |
| 🧠 Quiz | Atividades para testar os conhecimentos |
| 📚 Materiais | Materiais educativos e conteúdos complementares |
| 👥 Sobre | Informações sobre o projeto e participantes |

---

# 💡 Proposta

A ideia principal é transformar conteúdos que podem parecer complexos em informações mais simples e acessíveis.

A plataforma poderá apresentar:

- Textos explicativos;
- Cards informativos;
- Exemplos práticos;
- Perguntas e respostas;
- Quizzes;
- Materiais educativos;
- Links para fontes confiáveis;
- Conteúdos relacionados aos direitos trabalhistas.

Dessa forma, o projeto pretende estimular o usuário a **buscar informações, questionar conteúdos e verificar fontes antes de compartilhar informações**.

---

# 🛠️ Tecnologias utilizadas

## Front-end

### Angular

Responsável pela construção da interface da aplicação e pela interação com o usuário.

### TypeScript

Utilizado no desenvolvimento do front-end com Angular, proporcionando organização e tipagem ao código.

---

## Back-end

### Django

Framework Python utilizado para desenvolver a estrutura do back-end da aplicação.

### Django REST Framework

Responsável pela criação da API REST que permite a comunicação entre o Angular e o Django.

---

## Banco de dados

### PostgreSQL

Banco de dados relacional utilizado para armazenar as informações da plataforma.

Entre os dados que poderão ser armazenados estão:

- Usuários;
- Conteúdos;
- Categorias;
- Perguntas;
- Respostas;
- Resultados dos quizzes;
- Materiais educativos.

---

# 🏗️ Arquitetura

A aplicação seguirá uma arquitetura separando o front-end, back-end e banco de dados.

```text
                    ┌──────────────────────┐
                    │       USUÁRIO        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Angular + TypeScript │
                    │      Front-end       │
                    └──────────┬───────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │        Django        │
                    │   Django REST API    │
                    │       Back-end       │
                    └──────────┬───────────┘
                               │
                         Django ORM
                               │
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │    Banco de Dados    │
                    └──────────────────────┘
```

## ✅ Funcionalidades atuais

- Navegação responsiva para computador e celular;
- Conteúdos sobre democracia, desinformação, checagem e direitos trabalhistas;
- Quiz interativo com pontuação e resultado;
- Criação de conta e login por e-mail ou usuário;
- Logout e controle de sessão por token;
- Perfil personalizável com bio, foto por URL ou avatar ilustrativo;
- Área exclusiva para criar publicações;
- Área exclusiva para visualizar as postagens;
- Busca por palavras nos posts, sem distinguir acentos ou maiúsculas, e filtros por assunto;
- Assuntos educativos agrupados na busca e glossário dos principais temas;
- Publicações com texto e upload direto de fotos ou vídeos, com prévia;
- Curtidas e comentários autenticados;
- Exclusão permitida somente para o autor da publicação;
- Interface responsiva com animações leves e suporte a redução de movimento.

## 🌐 Links

- Site: https://marcoslima2207.github.io/Cidadania-na-Escola/
- API: https://cidadania-na-escola-api.onrender.com/api/

O front-end é publicado no GitHub Pages e a API Django é executada no Render.

## 🚀 Como executar localmente

### Back-end

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

A API local ficará disponível em `http://localhost:8000/api/`.

### Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

O site local ficará disponível em `http://localhost:4200/`.

Para gerar a versão de produção:

```bash
npm run build
```

## 🧪 Testes e validação

```bash
cd backend
python manage.py test api.tests
```

```bash
cd frontend
npm run build
```

## 🔐 Configuração de produção

O back-end usa variáveis de ambiente para produção:

```text
DJANGO_SECRET_KEY=chave-secreta
DEBUG=False
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://marcoslima2207.github.io
MEDIA_ROOT=/caminho/do/disco/persistente/media
```

O deploy do Render deve executar as migrações antes de iniciar o serviço:

```bash
pip install -r requirements.txt && python manage.py migrate
```

### Fotos e vídeos da comunidade

A migração `0005_post_media_file` adiciona o arquivo das publicações. O formulário envia
`multipart/form-data` com `media_file`, sem precisar de URL externa. São aceitos JPG,
PNG, WEBP, MP4, WEBM e MOV de até 20 MB. A API verifica o tipo, a extensão e a assinatura
do arquivo, determina se é foto ou vídeo e retorna o endereço em `media_url`.
Publicações antigas que usam URLs continuam disponíveis.

Os arquivos são salvos em `MEDIA_ROOT` (por padrão, `backend/media`) e servidos em
`/media/`. Em produção, configure `MEDIA_ROOT` em um volume persistente com backup;
o disco temporário do serviço não conserva uploads após recriações. Os arquivos não
entram no Git. O navegador precisa suportar o codec do vídeo para reproduzi-lo.

### Busca e comunidade

`GET /api/posts/?search=palavra&category=Cidadania` busca no título, no texto e na
categoria. Os parâmetros são opcionais. O significado exibido vem do glossário local;
quando não há definição cadastrada, a interface informa isso e apresenta os posts.
A busca atual percorre os textos dos posts no servidor para normalizar acentos;
para grandes volumes, substitua por um índice de busca com paginação.

A leitura de publicações e comentários é pública. Publicar, curtir e comentar exigem
autenticação. A curtida pode ser desfeita, e somente o autor pode editar ou excluir
sua publicação.

## 🔭 Futuras melhorias

- Armazenamento permanente em PostgreSQL com backups;
- Recuperação de senha por e-mail;
- Confirmação de e-mail no cadastro;
- Edição e exclusão de comentários próprios;
- Respostas encadeadas aos comentários;
- Notificações de curtidas e comentários;
- Paginação e carregamento progressivo das postagens;
- Moderação e denúncia de conteúdo;
- Painel administrativo para professores e equipe do projeto;
- Testes end-to-end no fluxo de login e publicação;
- Melhorias de acessibilidade e suporte multilíngue.

## 📄 Licença e contexto acadêmico

Este projeto foi desenvolvido como uma plataforma educacional para um projeto de extensão universitária. O conteúdo tem finalidade informativa e educativa e não substitui orientação jurídica ou profissional.
