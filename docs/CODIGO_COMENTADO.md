# Guia do código comentado

Os arquivos de código têm comentários em português sobre sua finalidade, o estado
mantido pelas classes e seus principais métodos. Este guia complementa os comentários,
especialmente nos arquivos de configuração que exigem JSON sem comentários.

## Caminho de uma ação no site

1. `frontend/src/main.ts` inicia o Angular com as opções de `app.config.ts`.
2. `app.routes.ts` escolhe qual página mostrar dentro do componente `App`.
3. A página usa `HttpClient` ou um serviço para enviar a requisição ao backend.
4. `backend/config/urls.py` encaminha a chamada ao roteador em `api/urls.py`.
5. `api/views.py` verifica as permissões e executa a operação pedida.
6. `api/serializers.py` valida a entrada e prepara os dados da resposta.
7. `api/models.py` define os registros e relacionamentos que o Django salva no banco.
8. A página recebe a resposta e atualiza os dados exibidos no template.

## Como ler os comentários

- `//` explica TypeScript; `#` explica Python, YAML e dependências Python.
- `/* ... */` explica CSS e `<!-- ... -->` explica HTML.
- O comentário antes de um método descreve sua responsabilidade e o resultado esperado.
- `template` é o HTML exibido pelo componente; `styles` contém seu CSS local.
- `[(ngModel)]` sincroniza um campo com uma variável; `(click)` e `(change)` chamam métodos.
- `@if` mostra elementos sob uma condição; `@for` repete elementos para uma lista.
- `subscribe` trata a resposta assíncrona: `next` recebe o sucesso e `error` trata a falha.
- Um `Observable` representa um fluxo de dados que pode entregar a resposta depois.

## Arquivos de configuração

### `frontend/package.json`

Define o projeto Node, seus comandos e suas bibliotecas. Esse arquivo exige JSON
sem comentários; as explicações ficam aqui para preservar o formato.

| Parte | Função |
| --- | --- |
| `scripts.start` | Inicia o servidor de desenvolvimento com `npm start`. |
| `scripts.build` | Compila a aplicação com `npm run build`. |
| `scripts.watch` | Recompila em desenvolvimento quando os arquivos mudam. |
| `scripts.test` | Executa os testes Angular/Vitest. |
| `dependencies` | Bibliotecas da aplicação, incluindo Angular, RxJS e tslib. |
| `devDependencies` | Ferramentas de compilação, formatação e testes, como TypeScript, Prettier e Vitest. |
| `private` | Impede publicar acidentalmente o pacote no registro npm. |
| `packageManager` | Registra a versão de npm declarada pelo projeto. |

`package-lock.json` é gerado pelo npm e registra versões exatas das dependências.
Ele acompanha mudanças de bibliotecas, sem edição manual para acrescentar comentários.

### `frontend/angular.json`

Configura como o Angular compila, serve e testa a aplicação. Também exige JSON sem comentários.

| Parte | Função |
| --- | --- |
| `projects.frontend` | Identifica a aplicação e o diretório de seu código. |
| `build.options.browser` | Indica `src/main.ts` como entrada da compilação. |
| `build.options.tsConfig` | Usa as regras TypeScript de `tsconfig.app.json`. |
| `build.options.assets` | Copia os recursos de `public` para o site compilado. |
| `build.options.styles` | Carrega os estilos globais de `src/styles.css`. |
| `production.fileReplacements` | Troca o endereço local da API pelo endereço de produção. |
| `production.budgets` | Define limites de tamanho que geram avisos ou falhas no build. |
| `production.outputHashing` | Inclui hashes nos arquivos gerados para atualizar o cache do navegador. |
| `development` | Habilita mapas de código e desabilita otimização para facilitar a depuração. |
| `serve` | Seleciona o build utilizado pelo servidor de desenvolvimento. |
| `test` | Seleciona o executor dos testes da aplicação. |

Os arquivos `tsconfig*.json` aceitam comentários e contêm explicações junto às regras
de compilação. Eles separam os arquivos da aplicação dos arquivos de teste.

## Banco, mídia e autenticação

- `ForeignKey` liga vários registros a outro registro, como os posts ao autor.
- `OneToOneField` cria uma relação exclusiva, como o perfil de cada usuário.
- `on_delete=CASCADE` remove registros relacionados do banco quando a referência é excluída.
- As migrações registram a evolução das tabelas e são aplicadas com `manage.py migrate`.
- `FileField` guarda o caminho do upload no banco; o arquivo fica no armazenamento de mídia.
- `MEDIA_ROOT` aponta para a pasta física; `MEDIA_URL` define o prefixo público dos arquivos.
- O token é enviado em `Authorization: Token ...`. A existência do token no navegador
  permite adaptar a tela; a API verifica a autenticação e as permissões de cada ação.

## Verificação e publicação

`backend/api/tests.py` verifica os endpoints usando dados temporários. Os arquivos
`*.spec.ts` verificam componentes e chamadas HTTP simuladas do frontend.

`.github/workflows/deploy-pages.yml` compila e publica o frontend no GitHub Pages.
`render.yaml` descreve o backend Django e seu banco PostgreSQL no Render.

`frontend/src/app/app.html` e `app.css` são arquivos auxiliares. O componente `App`
atual utiliza HTML e CSS definidos diretamente em `app.ts`.
