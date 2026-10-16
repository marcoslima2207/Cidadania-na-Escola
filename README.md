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
[Acesse o site](https://marcoslima2207.github.io/Cidadania-na-Escola/)

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

A plataforma é uma aplicação web com conteúdos educativos organizados por temas,
quiz gamificado e uma comunidade para compartilhar publicações e trocar conhecimentos.

### Áreas da plataforma

| Área | Descrição |
|---|---|
| 🏠 Início | Apresentação do projeto e principais conteúdos |
| 🏛️ Democracia | Conteúdos sobre democracia e participação cidadã |
| 📰 Desinformação | Informações sobre fake news e seus impactos |
| 🔎 Checagem | Orientações para verificar informações |
| ⚖️ Direitos Trabalhistas | Conteúdos introdutórios sobre legislação trabalhista |
| 🧠 Quiz | Trilha por temas, níveis, corações, XP e desafio diário |
| 🔎 Busca | Pesquisa de publicações por palavra e assunto, com glossário |
| 👥 Comunidade | Publicações, fotos, vídeos, curtidas e comentários |
| 👤 Perfil | Bio, avatares ilustrados e foto personalizada |
| 👥 Sobre | Informações sobre o projeto e participantes |

---

# 💡 Proposta

A ideia principal é transformar conteúdos que podem parecer complexos em informações mais simples e acessíveis.

A plataforma reúne:

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

Para entender a estrutura, os comentários e as configurações, consulte o
[guia do código comentado](docs/CODIGO_COMENTADO.md).

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

A aplicação separa o front-end Angular, a API Django REST e o banco de dados.
O desenvolvimento local usa SQLite; a configuração de produção utiliza PostgreSQL.

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

O [guia do quiz gamificado e login Google](docs/QUIZ.md) explica as novas rotas,
as migrações, os corações, o progresso e a configuração das integrações externas.

- Navegação responsiva para computador e celular;
- Conteúdos sobre democracia, desinformação, checagem e direitos trabalhistas;
- Quiz com seis temas, doze níveis, corações diários, XP e progresso salvo;
- Desafio diário com integração de IA e banco educativo de reserva identificado;
- Acesso com Google preparado para configuração do Client ID no backend;
- Criação de conta e login por e-mail ou usuário;
- Logout e controle de sessão por token;
- Perfil personalizável com bio, upload de foto, foto por URL ou oito avatares ilustrados;
- Área exclusiva para criar publicações;
- Área exclusiva para visualizar as postagens;
- Busca por palavras nos posts, sem distinguir acentos ou maiúsculas, e filtros por assunto;
- Assuntos educativos agrupados na busca e glossário dos principais temas;
- Publicações com texto e upload direto de fotos ou vídeos, com prévia;
- Curtidas e comentários autenticados;
- Exclusão permitida somente para o autor da publicação;
- Interface responsiva com animações leves e suporte a redução de movimento.

## 🆕 Melhorias implementadas

### Carrossel da página inicial — M01

- Corrigido o deslocamento das setas para avançar ou recuar exatamente um post por clique;
- O cálculo considera a largura do cartão e o espaçamento entre os posts;
- Comportamento adaptado para computador e celular, com limites no primeiro e no último post.

### Quiz gamificado

O quiz fixo foi substituído por uma trilha de aprendizagem inspirada no Duolingo,
mantendo a identidade visual do projeto. A mudança de interface foi concentrada no quiz.

- **Seis temas:** Cidadania, Democracia, Desinformação, Checagem de informação,
  Direitos trabalhistas e Educação;
- **Doze níveis e 36 perguntas iniciais**, com duas lições por tema e explicações educativas;
- Liberação sequencial dos níveis após atingir pelo menos **70% de acertos**;
- **Cinco corações por dia**, com perda de um coração por erro e renovação na primeira
  interação após a meia-noite, no horário de Brasília;
- **Dez XP por acerto na primeira conclusão aprovada**, sem repetir a recompensa ao refazer a lição;
- Barra de progresso, destaque da resposta correta e resultado ao final da tentativa;
- Progresso salvo por conta e retomada de tentativas incompletas no mesmo dia;
- Cálculo de vidas, pontuação e desbloqueios no servidor, sem enviar o gabarito antecipadamente;
- Reenvio da mesma resposta sem descontar outro coração ou duplicar XP;
- Componentes Angular com interfaces TypeScript, signals e detecção de mudanças `OnPush`;
- Modelos Django para temas, níveis, progresso, desafios diários e tentativas,
  com migrações que preservam os dados anteriores.

A trilha pode ser consultada sem login. Para jogar e salvar a evolução, é necessário entrar na conta.

### Desafio diário com integração de IA — M03

- Integração com o Gemini para gerar **12 perguntas por dia**, duas de cada tema;
- Conjunto salvo por data e compartilhado entre os participantes daquele dia;
- Validação das alternativas, explicações, quantidade e temas, evitando repetir
  os enunciados do dia anterior;
- Banco educativo de reserva quando a chave não estiver configurada, o provedor
  estiver indisponível ou a resposta gerada for inválida;
- Identificação da origem na tela: **Gerado por IA** ou **Banco educativo**;
- Comando `python manage.py gerar_quiz_diario` para preparar o desafio pelo servidor.

### Login com conta Google — M05

- Botão oficial de acesso Google nas telas de entrar e criar conta;
- Validação da credencial no backend com a biblioteca `google-auth`;
- Verificação de e-mail, validade da credencial e nonce temporário de uso único;
- Criação de conta ou associação permitida com uma conta existente;
- Login por e-mail ou usuário e senha mantido disponível.

**As integrações de Google e IA estão implementadas no código.** Seu funcionamento
em produção depende das variáveis de ambiente configuradas no Render e da
disponibilidade dos serviços externos. A configuração de produção ainda não foi
validada nesta etapa; enviar o código ao GitHub não cadastra essas variáveis.

### Comunidade, limpeza e performance

- Suporte a imagens JFIF nas publicações, além dos formatos já aceitos;
- Atualização do feed após a resposta da API no Angular sem Zone.js;
- Bloqueio de envios duplicados durante uma publicação e tratamento de falhas de upload;
- Remoção do feed de demonstração, do modal de login inacessível e do formulário
  antigo de publicação da página inicial, junto de seus estilos e consultas sem uso;
- Remoção de três serviços Angular sem consumidores que usavam endereço fixo de localhost;
- Centralização dos novos fluxos de sessão, mensagens de erro e emissão de tokens;
- Carregamento das páginas secundárias sob demanda;
- Aplicação do filtro de categoria antes da normalização dos textos na busca;
- Remoção dos arquivos Python compilados que estavam versionados;
- Padronização dos arquivos alterados com Prettier e Ruff.

As regras e os endpoints completos estão no [guia do quiz e login Google](docs/QUIZ.md).

## 🌐 Links

- [Site publicado](https://marcoslima2207.github.io/Cidadania-na-Escola/)
- [API Django](https://cidadania-na-escola-api.onrender.com/api/)

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

Na validação das melhorias, passaram **48 testes no Django** e **19 testes no Angular**,
além do build de produção. Também foram conferidos no navegador o carrossel em
computador e celular e os fluxos de resposta, perda de coração, retomada de tentativa,
aprovação, ganho de XP e liberação do próximo nível.

Os testes de Google e IA simulam os provedores. A autenticação Google e a geração
real de perguntas ainda precisam ser verificadas com as configurações de produção.

```bash
cd backend
python manage.py makemigrations --check --dry-run
python manage.py test api
```

```bash
cd frontend
npm test -- --watch=false
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

### Ativar Google e IA no Render

No painel do Render, abra o serviço **`cidadania-na-escola-api`**, entre em
**Environment** e adicione uma variável por linha:

| Nome da variável | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth do tipo Aplicativo da Web, terminado em `.apps.googleusercontent.com` |
| `GEMINI_API_KEY` | Chave da API Gemini criada no Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.8-flash`, padrão do projeto, ou outro modelo compatível disponível na conta |

Cadastre `https://marcoslima2207.github.io` como origem JavaScript autorizada
do cliente Google, sem incluir o caminho `/Cidadania-na-Escola`.
O frontend recebe o Client ID público pela API; a chave da IA permanece no backend.
Use apenas valores de exemplo na documentação e mantenha as chaves reais fora do Git.

Depois de salvar as variáveis, publique novamente o serviço para que sejam carregadas.
Sem as configurações externas, o login por senha e o quiz com o banco educativo
continuam disponíveis. Se o desafio do dia já tiver sido salvo com o banco de reserva,
a IA será usada na próxima data ainda não gerada.

Consulte o [passo a passo e as regras das integrações](docs/QUIZ.md).

### Fotos e vídeos da comunidade

A migração `0005_post_media_file` adiciona o arquivo das publicações. O formulário envia
`multipart/form-data` com `media_file`, sem precisar de URL externa. São aceitos JPG,
JPEG, JFIF, PNG, WEBP, MP4, WEBM e MOV de até 20 MB. A API verifica o tipo, a extensão e a assinatura
do arquivo, determina se é foto ou vídeo e retorna o endereço em `media_url`.
Publicações antigas que usam URLs continuam disponíveis.

O perfil também aceita upload direto em `PATCH /api/auth/profile/`, com o campo
`avatar_file`: JPG, JPEG, JFIF, PNG ou WEBP de até 5 MB. O endereço retornado é
`avatar_file_url`. Escolher uma ilustração ou um link substitui a foto enviada;
atualizar somente a bio preserva a foto. A migração `0006_profile_avatar_file_and_choices`
adiciona o upload e converte as escolhas antigas para as novas ilustrações.

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

- Configuração e validação das integrações Google e Gemini em produção;
- Backups e melhorias na persistência de dados e arquivos enviados;
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
