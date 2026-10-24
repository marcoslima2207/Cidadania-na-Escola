<div align="center">

# 🏛️ Cidadania na Escola

### Cidadania também se aprende.

Informação de qualidade para fortalecer a educação, a participação cidadã e o pensamento crítico.

![Status](https://img.shields.io/badge/status-em%20evolução-0A901C)
![Projeto](https://img.shields.io/badge/projeto-extensão%20universitária-002D9A)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/Django%20REST%20Framework-A30000)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

[🌐 Acessar a plataforma](https://marcoslima2207.github.io/Cidadania-na-Escola/)

</div>

---

## 📚 Sobre o projeto

**Cidadania na Escola: informação de qualidade também é conquista** é um projeto de extensão universitária desenvolvido pela equipe **Código Cidadão**.

A proposta aproxima conhecimentos sobre cidadania, democracia, desinformação, checagem de informações e direitos trabalhistas da comunidade escolar.

A plataforma utiliza a tecnologia como ferramenta de educação e conscientização, oferecendo conteúdos organizados, atividades interativas e um espaço de participação.

Os estudantes da **Educação de Jovens e Adultos — EJA** fazem parte do público a que o projeto se dirige.

## 🎯 Objetivos

- Disponibilizar conteúdos educativos com linguagem clara e acessível.
- Explicar direitos, deveres e formas de participação cidadã.
- Incentivar a leitura crítica e a verificação de informações.
- Apresentar conhecimentos introdutórios sobre direitos trabalhistas.
- Apoiar a aprendizagem por meio de quizzes e explicações educativas.
- Promover a troca de conhecimentos na comunidade escolar.

## 🌐 Áreas da plataforma

| Área | Recursos |
| --- | --- |
| Início | Apresentação do projeto, categorias educativas, publicações em destaque e acesso ao quiz |
| Assuntos e busca | Pesquisa de publicações, filtros por categoria, glossário e conteúdos recentes |
| Democracia e Cidadania | Conteúdos sobre direitos, deveres e participação social |
| Desinformação | Informações sobre notícias falsas e compartilhamento responsável |
| Checagem de Informação | Orientações para verificar fontes e contexto |
| Direitos Trabalhistas | Conteúdos introdutórios sobre o mundo do trabalho |
| Quiz | Trilha de aprendizagem, lições, vidas, XP, progresso e desafio diário |
| Sobre | Proposta, história, missão, visão, valores e equipe Código Cidadão |
| Comunidade | Feed com publicações, fotos, vídeos, curtidas e comentários |
| Publicar | Formulário com categoria, título, texto, upload e prévia do arquivo |
| Meu perfil | Biografia, oito avatares ilustrados, upload de foto e imagem por link |
| Acesso | Cadastro, login por usuário ou e-mail e integração com Google |

## 🎨 Redesign da interface

A interface foi modernizada na aplicação Angular existente, preservando rotas, autenticação, integrações e regras de negócio.

O redesign inclui:

- Header e rodapé compartilhados.
- Navegação mobile com indicação da página ativa.
- Hero institucional com imagem educativa.
- Cards de assuntos e publicações.
- Carrossel responsivo com avanço de um conteúdo por clique.
- Pesquisa ampla e filtros por categoria.
- Trilha de aprendizagem com etapas conectadas.
- Feed organizado com autor, data, categoria e mídia.
- Formulários com rótulos, validações e feedback.
- Estados de carregamento, erro e ausência de conteúdo.
- Imagens WebP e carregamento das páginas secundárias sob demanda.

Os destaques e resultados de busca utilizam as publicações reais da API. Quando não há dados, a interface apresenta estados vazios.

### Identidade visual

| Cor | Código |
| --- | --- |
| Azul institucional | `#002D9A` |
| Verde institucional | `#0A901C` |
| Amarelo institucional | `#E7B400` |
| Branco creme | `#FFFCF7` |
| Azul vibrante | `#0047F1` |
| Cinza neutro | `#B4B4B4` |

O design system organiza cores, tipografia, espaçamentos, sombras, bordas, botões, campos e estados interativos em variáveis CSS globais.

A representação da marca existente foi preservada. As novas ilustrações são decorativas e não representam integrantes reais da equipe.

### Acessibilidade e responsividade

- Navegação por teclado com foco visível.
- Link para pular diretamente ao conteúdo.
- Menu mobile com fechamento por Escape e retorno do foco.
- Rótulos associados aos campos.
- Mensagens acessíveis de carregamento, sucesso e erro.
- Estados identificados por texto, além das cores.
- Suporte a redução de movimento.
- Layouts adaptados para celular, tablet e computador.

## ✅ Funcionalidades

### Conta e perfil

- Cadastro e login por e-mail ou nome de usuário.
- Autenticação por token e logout.
- Integração com Google, dependente de configuração no backend.
- Biografia de até 240 caracteres.
- Oito avatares ilustrados.
- Foto por upload ou URL.
- Persistência das preferências na conta.

### Comunidade e publicações

- Leitura pública de publicações e comentários.
- Filtros por categoria.
- Publicações com texto e foto ou vídeo opcional.
- Prévia do arquivo antes do envio.
- Curtidas que podem ser desfeitas.
- Comentários autenticados.
- Exclusão de publicações pelo próprio autor.
- Tratamento de erros e bloqueio de envios duplicados durante as requisições.

Publicar, curtir e comentar exigem autenticação. As permissões são verificadas pelo backend.

### Assuntos e busca

- Pesquisa no título, texto e categoria das publicações.
- Normalização de acentos e maiúsculas no servidor.
- Combinação de palavra pesquisada e categoria.
- Glossário local dos principais temas.
- Exibição de publicações recentes e resultados relacionados.

As categorias de publicação e os assuntos educativos são conjuntos distintos, respeitando os contratos existentes da API.

## 🧠 Quiz gamificado

A trilha inicial possui **seis temas, doze níveis e 36 perguntas**, com explicações educativas.

### Temas

1. Cidadania.
2. Democracia.
3. Desinformação.
4. Checagem de Informação.
5. Direitos Trabalhistas.
6. Educação.

### Regras de aprendizagem

- Duas lições por tema, com três perguntas em cada lição inicial.
- Liberação sequencial após atingir pelo menos **70% de acertos**.
- Nas lições de três perguntas, a aprovação exige três acertos.
- **Cinco vidas por dia**, com perda de uma vida por resposta incorreta.
- Renovação das vidas na primeira interação do novo dia, considerando o horário de Brasília.
- **Dez XP por acerto na primeira conclusão aprovada**.
- Repetir uma lição ou desafio já aprovado não concede novamente a recompensa.
- Tentativas incompletas podem ser retomadas no mesmo dia.
- Progresso e XP permanecem vinculados à conta.

O servidor controla vidas, respostas, pontuação e desbloqueios. O frontend apresenta os dados recebidos da API.

A trilha pode ser consultada sem login. Para jogar e salvar o progresso, é necessário entrar na conta.

### Desafio diário

- Doze perguntas por dia, com duas de cada tema.
- Integração com Gemini para geração de perguntas.
- Banco educativo de reserva quando a integração não estiver configurada ou a geração falhar.
- Identificação da origem na interface: **Gerado por IA** ou **Banco educativo**.
- Conjunto de perguntas salvo por data e compartilhado entre os participantes daquele dia.

A confirmação visual de conclusão do desafio aparece após aprovação confirmada pela API durante a sessão atual da tela.

As integrações externas dependem de configuração e disponibilidade dos respectivos serviços.

## 🛠️ Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | Angular 21, TypeScript, HTML e CSS |
| Estado e interface | Signals, componentes standalone e RxJS |
| Backend | Python, Django e Django REST Framework |
| Autenticação | Tokens do DRF e integração com Google |
| Banco local | SQLite |
| Banco de produção | PostgreSQL |
| Testes do frontend | Vitest e ferramentas de teste do Angular |
| Hospedagem do frontend | GitHub Pages |
| Hospedagem da API | Render |
| Publicação do frontend | GitHub Actions |

O workflow utiliza Node.js 22. O ambiente local utilizado no desenvolvimento possui Python 3.14.

## 🏗️ Arquitetura

```text
Usuário
   │
   ▼
Angular + TypeScript + CSS
   │
   │ HTTP / JSON e uploads multipart
   ▼
Django REST Framework
   │
   ▼
Django ORM
   │
   ├── SQLite no desenvolvimento local
   └── PostgreSQL na configuração de produção

Arquivos enviados → MEDIA_ROOT
```

### Organização do repositório

```text
Cidadania-na-Escola/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── backend/
│   ├── api/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── avatars/
│   │   └── illustrations/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   └── styles/
│   └── package.json
├── docs/
├── render.yaml
└── README.md
```

## 🚀 Executar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/marcoslima2207/Cidadania-na-Escola.git
cd Cidadania-na-Escola
```

### 2. Iniciar o backend

No Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

No Linux ou macOS, utilize `.venv/bin/python` no lugar de `.\.venv\Scripts\python.exe`.

A API local ficará disponível em:

```text
http://localhost:8000/api/
```

As migrações também preparam os temas, níveis e perguntas iniciais do quiz.

### 3. Iniciar o frontend

Em outro terminal, partindo da raiz do repositório:

```bash
cd frontend
npm ci
npm start
```

Acesse:

```text
http://localhost:4200/
```

O frontend de desenvolvimento consulta a API local. O build de produção utiliza o endereço definido em `frontend/src/app/api-config.prod.ts`.

## 🧪 Testes e validação

Na validação do redesign:

- **36 testes Angular passaram em 7 arquivos**.
- O build de produção compilou sem alertas de orçamento.
- As **12 rotas** foram revisadas em **320, 768 e 1280 pixels**.
- O hero também foi conferido em 390 pixels.
- Foram verificados navegação mobile, foco, busca, carrossel, comentários, publicação, perfil e quiz.

Os testes de integração no navegador utilizaram uma API Django local com banco e mídia descartáveis, sem alterar os dados reais.

### Testes do frontend

Na pasta `frontend`:

```bash
npm test -- --watch=false
```

### Verificações do backend

Na pasta `backend`, utilizando o ambiente virtual:

```powershell
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test api
```

Os testes das integrações Google e IA simulam os provedores. A validação real dessas integrações depende das configurações e credenciais do ambiente.

## 📦 Build e publicação

### Frontend — GitHub Pages

Na pasta `frontend`, gere o build com o caminho do repositório:

```bash
npm run build -- --base-href /Cidadania-na-Escola/
```

Os arquivos compilados são gerados em:

```text
frontend/dist/frontend/browser/
```

O workflow **Deploy Angular to GitHub Pages**:

1. Instala as dependências com `npm ci`.
2. Compila o Angular com o `base-href` do projeto.
3. Prepara o fallback das rotas Angular.
4. Publica o resultado no GitHub Pages.

A publicação é acionada por alterações enviadas à branch `main` ou por execução manual do workflow.

### Backend — Render

O arquivo `render.yaml` descreve a configuração do serviço Django e do PostgreSQL.

O comando de build instala as dependências e aplica as migrações:

```bash
pip install -r requirements.txt && python manage.py migrate
```

O serviço inicia com:

```bash
gunicorn config.wsgi:application
```

A publicação do frontend e a implantação do backend são processos separados.

## 🔐 Configuração do ambiente

As configurações de produção ficam no backend:

| Variável | Finalidade |
| --- | --- |
| `DJANGO_SECRET_KEY` | Chave secreta do Django |
| `DEBUG` | Usar `False` em produção |
| `ALLOWED_HOSTS` | Hosts autorizados a acessar o Django |
| `CORS_ALLOWED_ORIGINS` | Origens autorizadas do frontend |
| `DB_ENGINE` | Usar `postgresql` para habilitar esse banco |
| `DB_NAME` | Nome do banco |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_HOST` | Endereço do banco |
| `DB_PORT` | Porta do banco |
| `MEDIA_ROOT` | Diretório dos arquivos enviados |
| `GOOGLE_CLIENT_ID` | Client ID público do aplicativo Google |
| `GEMINI_API_KEY` | Chave da integração com Gemini |
| `GEMINI_MODEL` | Identificador do modelo compatível com a integração |

A origem do frontend publicado é:

```text
https://marcoslima2207.github.io
```

Essa origem deve ser considerada na configuração de CORS e, para o acesso Google, nas origens JavaScript autorizadas do cliente OAuth.

O frontend obtém o Client ID público pela API. A chave do Gemini permanece no backend.

Credenciais reais, arquivos `.env`, banco local e uploads não devem ser versionados.

Sem a configuração das integrações externas, o login por senha e o quiz com o banco educativo permanecem disponíveis.

Consulte [docs/QUIZ.md](docs/QUIZ.md) para os detalhes de configuração.

## 🖼️ Fotos, vídeos e armazenamento

| Uso | Formatos aceitos | Limite |
| --- | --- | --- |
| Fotos de publicações | JPG, JPEG, JFIF, PNG e WEBP | 20 MB |
| Vídeos de publicações | MP4, WEBM e MOV | 20 MB |
| Foto de perfil | JPG, JPEG, JFIF, PNG e WEBP | 5 MB |

Os arquivos são enviados por `multipart/form-data`, com validação no backend.

- Publicações usam o campo `media_file`.
- Fotos de perfil usam o campo `avatar_file`.
- Publicações antigas com mídia por URL continuam compatíveis.
- Os arquivos ficam em `MEDIA_ROOT`, por padrão `backend/media`.
- Em produção, a conservação dos uploads depende de armazenamento persistente e backup.
- A reprodução dos vídeos depende do suporte do navegador ao codec utilizado.

## 📖 Documentação

| Documento | Conteúdo |
| --- | --- |
| [Design system](docs/DESIGN_SYSTEM.md) | Tokens, componentes visuais, responsividade e acessibilidade |
| [Redesign](docs/REDESIGN.md) | Etapas, arquivos alterados, verificações e limites da validação |
| [Assets visuais](docs/ASSETS_VISUAIS.md) | Origem das imagens, otimizações e prompts utilizados |
| [Quiz e login Google](docs/QUIZ.md) | Regras, endpoints e integrações externas |
| [Backend](docs/BACKEND.md) | Estrutura e funcionamento da API |
| [Banco de dados](docs/DATABASE.md) | Organização dos dados |
| [Código comentado](docs/CODIGO_COMENTADO.md) | Guia de leitura do código |

## 🔭 Próximas melhorias

- Validação das integrações Google e Gemini no ambiente de produção.
- Recuperação de senha por e-mail.
- Confirmação de e-mail no cadastro.
- Paginação e carregamento progressivo das publicações.
- Edição de publicações pela interface.
- Edição e exclusão de comentários próprios.
- Respostas encadeadas aos comentários.
- Notificações de interações.
- Moderação e denúncia de conteúdo.
- Ampliação dos testes automatizados de ponta a ponta.
- Evolução da acessibilidade e revisão pedagógica dos conteúdos.

Esses itens representam possibilidades de evolução e não funcionalidades já disponíveis.

## 👥 Equipe e contexto acadêmico

Projeto de extensão universitária desenvolvido pela equipe **Código Cidadão**, formada por:

- Marcos Eduardo
- Pedro Henrique
- Guilherme Araujo
- Lauro Vitor
- Caua Vitor

A equipe reúne tecnologia e educação para apoiar a formação cidadã.

Os conteúdos da plataforma têm finalidade informativa e educativa.

---

<div align="center">

**Cidadania na Escola**

Informação de qualidade também é conquista.

[🌐 Acessar a plataforma](https://marcoslima2207.github.io/Cidadania-na-Escola/)

</div>
