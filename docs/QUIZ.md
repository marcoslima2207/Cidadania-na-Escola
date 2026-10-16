# Quiz gamificado e acesso Google

O quiz agora usa a API Django. O restante do site conserva suas páginas e rotas.
As migrações `0007` a `0010` acrescentam os modelos sem remover usuários, posts,
perguntas ou resultados antigos. A migração de conteúdo cria seis temas, doze
níveis e 36 perguntas educativas com explicações.

## Executar

```powershell
cd backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver
```

Em outro terminal, execute `npm start` na pasta `frontend`.
O frontend de desenvolvimento consulta `http://localhost:8000/api`; o build
de produção mantém a API do Render configurada em `api-config.prod.ts`.

## Regras da trilha

- Temas: cidadania, democracia, desinformação, checagem de informação,
  direitos trabalhistas e educação. “Democracia e cidadania” é representado
  pelas duas unidades, sem duplicar o tema desinformação da imagem.
- Há duas lições por tema e três perguntas em cada lição.
- Os níveis são liberados em sequência, com aprovação a partir de 70%.
  Em uma lição de três perguntas, isso exige três acertos.
- Cada conta recebe cinco corações por dia. Um erro usa um coração.
  A renovação usa a data de Brasília, na primeira interação do novo dia.
- Uma primeira aprovação concede dez XP por acerto; repetir a mesma lição
  ou o mesmo desafio diário não concede XP adicional.
- O servidor calcula acertos, vidas, XP e desbloqueios. O navegador não envia
  pontuação e não recebe o gabarito antecipadamente.
- Tentativas incompletas são retomadas no mesmo dia. Após a meia-noite,
  inicia-se uma nova tentativa. Progresso e XP permanecem.
- A trilha é pública para consulta. Jogar e salvar progresso exigem uma conta.

## API

As ações autenticadas usam `Authorization: Token SEU_TOKEN`.

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/api/quiz/temas/` | Temas |
| GET | `/api/quiz/nivel/` | Níveis em ordem, com tema e quantidade de perguntas |
| GET | `/api/quiz/nivel/1/perguntas/` | Perguntas públicas, sem gabarito |
| POST | `/api/quiz/nivel/1/iniciar/` | Inicia ou retoma uma tentativa autenticada |
| GET | `/api/quiz/progresso/` | Progresso da conta autenticada |
| GET | `/api/quiz/diario/` | Data, origem e quantidade do desafio diário |
| POST | `/api/quiz/diario/` | Inicia ou retoma o desafio autenticado |
| POST | `/api/quiz/tentativas/ID/responder/` | Confere uma resposta e retorna explicação e progresso |
| GET | `/api/auth/google-config/` | Client ID público e nonce temporário |
| POST | `/api/auth/google/` | Valida a credencial Google e devolve a sessão do site |

Exemplo de resposta enviada:

```json
{"pergunta_id": 1, "alternativa": "a"}
```

Reenviar a mesma resposta é idempotente: não perde outra vida nem ganha mais XP.
Mudar uma resposta já enviada, pular perguntas, iniciar níveis bloqueados ou
responder a tentativas de outra pessoa é recusado. O endpoint legado
`/api/perguntas/` continua atendendo apenas às perguntas antigas sem nível;
ele não expõe os gabaritos da trilha.

## Login Google

Crie um cliente OAuth do tipo **Aplicativo da Web** no Google e cadastre como
origens JavaScript autorizadas as origens usadas pelo frontend, por exemplo:

```text
http://localhost:4200
http://127.0.0.1:4200
https://marcoslima2207.github.io
```

Configure no backend/Render:

```text
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

O frontend obtém o Client ID público da API; nenhum segredo OAuth é enviado
ao navegador. O botão oficial funciona nas abas de entrar e criar conta.
O backend usa `google-auth` para conferir assinatura, audiência, emissor e
expiração, exige e-mail verificado e confere um nonce de uso único, válido por
dez minutos e compartilhado entre os processos pelo banco.

A identidade é vinculada pelo `sub` do Google. Uma conta nova recebe senha
inutilizável. Para contas existentes, a associação automática exige que Google
seja a autoridade pelo e-mail Gmail ou domínio Workspace verificado. Nos demais
casos, a interface orienta entrar com a senha existente. Contas inativas são recusadas.
Sem Client ID, o formulário informa que Google ainda não foi configurado e
mantém login e cadastro por senha disponíveis.

Referência: [validação oficial de ID tokens Google](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Desafio diário por IA

Configure apenas no backend:

```text
GEMINI_API_KEY=sua-chave
GEMINI_MODEL=gemini-3.8-flash
```

`GEMINI_MODEL` é configurável conforme os modelos disponíveis na sua conta.
A integração usa a API REST de Interactions do Gemini com saída JSON estruturada.
A chave é enviada no cabeçalho, não na URL ou no código Angular.
Nenhum dado de alunos ou respostas de usuários é enviado ao provedor.

O primeiro acesso do dia gera e salva doze perguntas, duas por tema. Todos
recebem o mesmo conjunto daquele dia. O servidor valida estrutura, tamanho,
alternativas distintas, quantidade, categorias e ausência dos enunciados do dia
anterior. Uma concessão temporária no banco evita chamadas paralelas entre workers.
Falhas podem ser retomadas sem manter uma transação aberta durante a chamada externa.

Sem chave, em caso de falha do provedor ou de conteúdo inválido, é usado um
conjunto do banco educativo que também evita os enunciados do dia anterior.
A interface mostra **Banco educativo**, em vez de atribuir esse conteúdo à IA.
O banco de reserva é finito e pode reutilizar questões de dias mais antigos.
A validação estrutural não substitui a revisão pedagógica de fatos gerados por IA.

Para preparar o desafio antes dos acessos, um agendador externo pode executar
diariamente, após a meia-noite de Brasília:

```bash
python manage.py gerar_quiz_diario
```

Também é possível preparar uma data específica com `--data AAAA-MM-DD`.
Nenhum agendamento ou serviço pago é criado automaticamente. Um desafio já
salvo não é substituído quando uma chave é configurada no meio do dia; a IA
passa a ser usada na próxima data ainda não gerada.

Referência: [saída estruturada do Gemini](https://ai.google.dev/gemini-api/docs/structured-output).

## Limpeza e performance

- Removidos o feed de demonstração, o modal de login inacessível, o formulário
  antigo de publicação e seus estilos da página inicial. Essas rotinas não
  estavam conectadas aos controles visíveis e faziam uma consulta inútil ao feed.
- Removidos três serviços Angular sem consumidores, que apontavam a API fixa
  para localhost. O quiz usa um único serviço com a configuração do ambiente.
- Sessão e mensagens de erro dos novos fluxos são compartilhadas; emissão de
  token e criação de perfil são centralizadas no backend.
- Páginas secundárias carregam sob demanda. O quiz usa signals, valores
  derivados e detecção `OnPush`, sem recalcular agrupamentos a cada renderização.
- A busca aplica o filtro de categoria antes da normalização dos textos.
- O carrossel desloca a largura exata de um cartão mais o espaçamento,
  com medidas responsivas e botões limitados ao primeiro e ao último item.
- Arquivos alterados foram formatados com Prettier e Ruff. Alterações locais
  anteriores em comunidade, perfil e publicação foram preservadas.

## Verificar

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

Os testes de IA e Google simulam os provedores e não consomem serviços externos.
O teste real dessas integrações depende de credenciais válidas. A validação
de concorrência usa travas de linha no PostgreSQL; SQLite é adequado para
desenvolvimento, mas não oferece a mesma semântica de concorrência.
