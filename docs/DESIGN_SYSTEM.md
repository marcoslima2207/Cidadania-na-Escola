# Design system — Cidadania na Escola

Base visual compartilhada por todas as páginas. O redesign foi aplicado por etapas:
tokens, estrutura global, inicial, busca, quiz, sobre/comunidade e formulários.

## Organização

- `frontend/src/styles.css`: entrada dos estilos e importação das fontes existentes.
- `frontend/src/styles/tokens.css`: paleta, cores semânticas, tipografia, espaçamentos,
  containers, formas, sombras e transições.
- `frontend/src/styles/foundation.css`: base global, foco de teclado, texto acessível
  e preferências de movimento e contraste.
- `frontend/src/styles/components.css`: classes reutilizáveis com prefixo `ce-`.

Os estilos locais atuais continuam nos componentes Angular. Não usar seletores
globais genéricos como `.card`, `.button` ou `.form` para migrar as telas. As
variáveis antigas, como `--deep-blue` e `--gold`, são aliases da nova paleta.

## Cores

| Token                | Valor oficial | Aplicação                         |
| -------------------- | ------------- | --------------------------------- |
| `--ce-color-blue`    | `#002D9A`     | Títulos, links e ações principais |
| `--ce-color-green`   | `#0A901C`     | Identidade, ícones e progresso    |
| `--ce-color-yellow`  | `#E7B400`     | Ações em destaque                 |
| `--ce-color-cream`   | `#FFFCF7`     | Fundo da plataforma               |
| `--ce-color-vibrant` | `#0047F1`     | Foco e interação                  |
| `--ce-color-neutral` | `#B4B4B4`     | Elementos neutros e desabilitados |

Usar os tokens semânticos `--ce-color-text`, `--ce-color-text-muted`,
`--ce-color-border` e `--ce-color-surface` em vez de repetir valores hexadecimais.
Os tons derivados têm valores sólidos para texto e fundos suaves, e canais RGB
compartilhados para sombras e bordas translúcidas.

O botão amarelo usa texto azul. Textos pequenos de sucesso usam
`--ce-color-green-ink`, mais escuro que o verde institucional. Avisos e erros usam
texto amarelo escurecido sobre fundo suave, sempre com mensagem explícita; a cor
sozinha não identifica um erro.

## Componentes

| Classes                                                                        | Uso                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `ce-container`, `ce-container--form`, `ce-container--reading`                  | Larguras de página, formulário e leitura                |
| `ce-section`                                                                   | Espaçamento vertical responsivo                         |
| `ce-grid ce-grid--topics`                                                      | Grade de quatro, duas ou uma coluna                     |
| `ce-grid ce-grid--content`                                                     | Grade de três, duas ou uma coluna                       |
| `ce-eyebrow`, `ce-title`, `ce-section-title`, `ce-card-title`, `ce-lead`       | Hierarquia tipográfica                                  |
| `ce-card`                                                                      | Superfície branca com borda e sombra suave              |
| `ce-card ce-card--interactive`                                                 | Card cujo elemento inteiro é um link ou botão           |
| `ce-button`                                                                    | Ação principal azul                                     |
| `ce-button ce-button--accent`                                                  | Ação amarela                                            |
| `ce-button ce-button--secondary`                                               | Ação secundária com borda                               |
| `ce-button--full`                                                              | Modificador para ocupar a largura disponível            |
| `ce-link`                                                                      | Link de texto sublinhado                                |
| `ce-chip`                                                                      | Filtro; a seleção usa `aria-pressed` em botões          |
| `ce-badge`, `ce-badge--green`, `ce-badge--yellow`                              | Categoria ou estado textual                             |
| `ce-field`, `ce-field__label`, `ce-field__hint`, `ce-field__error`, `ce-input` | Campos com rótulo e feedback                            |
| `ce-notice`, `ce-notice--success`, `ce-notice--attention`, `ce-notice--error`  | Mensagens informativas                                  |
| `ce-empty-state`                                                               | Ausência de conteúdo                                    |
| `ce-spinner`, `ce-skeleton`                                                    | Indicadores visuais de carregamento                     |
| `ce-sr-only`                                                                   | Texto disponível a leitores de tela, oculto visualmente |

Os modificadores são usados junto à classe base. As classes apenas definem a
aparência; dados, permissões, validações e eventos continuam nos componentes e
serviços existentes. Não adicionar controles para ações não implementadas.

## Exemplos de uso

```html
<a routerLink="/buscar" class="ce-button ce-button--accent">
  Explorar conteúdos <span aria-hidden="true">→</span>
</a>

<div class="ce-field">
  <label class="ce-field__label" for="post-title">Título</label>
  <input
    id="post-title"
    class="ce-input"
    maxlength="200"
    aria-describedby="post-title-hint"
  />
  <p id="post-title-hint" class="ce-field__hint">Dê um título à publicação.</p>
</div>

<p class="ce-notice ce-notice--success" role="status">Perfil atualizado.</p>

<p role="status">
  <span class="ce-spinner" aria-hidden="true"></span>
  Carregando publicações…
</p>
```

## Acessibilidade e responsividade

- Preservar elementos nativos: links para navegação e botões para ações.
- Botões, filtros e campos têm altura mínima de `2.75rem` (44 px com fonte raiz padrão).
- Usar `disabled` em controles nativos durante operações quando a lógica atual exigir.
- Associar rótulos aos campos; ligar erros por `aria-describedby` e definir
  `aria-invalid="true"` somente quando houver falha de validação.
- Usar `role="status"` para atualizações e `role="alert"` para erros que precisam de
  atenção imediata. Skeletons são decorativos (`aria-hidden="true"`); manter uma
  mensagem de carregamento acessível na região.
- O foco global combina um anel azul e um contorno branco interno. Conferir os
  estilos locais ao adicionar novos controles.
- Grades passam para duas colunas até `64rem` e uma até `40rem`. Containers usam
  margens fluidas e títulos usam `clamp()`.
- Respeitar `prefers-reduced-motion` e o modo de cores forçadas. Não usar animações
  para transmitir informação essencial.

## Validação por etapa

O `App` organiza header, conteúdo e rodapé em uma coluna flexível, sem alturas
fixas para o conteúdo. O link "Pular para o conteúdo" move o foco para
`#main-content` sem mudar a rota. As páginas usam `section` ou `div`
na raiz para manter um único marco `main`.

A navegação compartilha o mesmo conjunto de links e ações entre desktop e mobile.
Até `64rem`, o menu é recolhido por CSS; `aria-expanded` informa seu estado e
`aria-current="page"` identifica a página ativa. Escape fecha o menu e devolve o
foco ao botão; navegação, clique externo e saída de foco também recolhem o menu.

O componente `BrandComponent` reaproveita o símbolo em CSS que já existia no
projeto. Header e rodapé usam a mesma marca. Nenhum arquivo gráfico de logotipo
foi encontrado no repositório; foi preservada a representação existente.

Executar o build de produção e os testes Angular existentes. Conferir no navegador
as larguras desktop e mobile, navegação por teclado, estados de carregamento e erro
e os fluxos afetados. A aplicação usa uma subpasta no GitHub Pages: preservar URLs
relativas de assets e os caminhos atuais do Angular Router.
