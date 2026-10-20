# Redesign da interface — Cidadania na Escola

Concluído em 20/10/2026. Implementação incremental na aplicação Angular existente,
seguindo a referência visual e a paleta institucional. A autorização final do
usuário permitiu concluir as etapas sem novas consultas.

## Etapas e arquivos

Os caminhos abaixo são relativos à raiz do repositório. A notação
`component.{ts,html,css}` indica os três arquivos correspondentes.

| Etapa | Resultado | Arquivos alterados ou criados |
| --- | --- | --- |
| 1–2. Análise e plano | Rotas, componentes, serviços, contratos de dados, mídia e regras existentes analisados antes da migração visual. | Nenhuma alteração de backend, rotas ou configuração de API. |
| 3. Design system | Paleta oficial, tons derivados, tipografia, espaços, cards, botões, campos, foco e estados compartilhados. | `frontend/src/styles.css`, `frontend/src/styles/tokens.css`, `frontend/src/styles/foundation.css`, `frontend/src/styles/components.css`, `docs/DESIGN_SYSTEM.md`. |
| 4. Estrutura global | Header responsivo, navegação ativa, menu com teclado, marca compartilhada, rodapé e um único marco principal. | `frontend/src/app/app.ts`, `frontend/src/index.html`, `frontend/src/app/components/brand/brand.component.{ts,css}`, `frontend/src/app/components/header/header.component.{ts,html,css}`, `frontend/src/app/components/footer/footer.component.{ts,html,css}`. |
| 5. Inicial | Hero azul com estudante, categorias, carrossel de publicações reais e convite para o quiz. | `frontend/src/app/pages/home/home.component.{ts,html,css}`, `frontend/src/app/educational-topics.ts`, `frontend/src/app/services/posts.service.ts`, `frontend/src/app/components/icon/icon.component.ts`, `frontend/src/app/components/topic-card/topic-card.component.ts`, `frontend/src/app/components/post-card/post-card.component.{ts,css}`. |
| 6. Assuntos e busca | Pesquisa ampla, filtros combinados, glossário existente, resultados recentes, carregamento e estado vazio. | `frontend/src/app/pages/buscar/buscar.component.{ts,html,css}`. |
| 7. Quiz | Banner, indicadores reais, trilha conectada, níveis concluídos/disponíveis/bloqueados, desafio diário e feedback das respostas. | `frontend/src/app/pages/quiz/quiz.component.{ts,html,css}`, `frontend/src/app/pages/quiz/quiz-question.component.{ts,html,css}`. |
| 8. Sobre e comunidade | História e apresentação do projeto com conteúdo documentado; feed com autor, data, categoria, mídia e interações existentes. | `frontend/src/app/pages/sobre/sobre.component.{ts,html,css}`, `frontend/src/app/pages/postagens/postagens.component.{ts,html,css}`. |
| 9. Publicar e perfil | Formulário com erros por campo e prévia; confirmação após envio real; opções de avatar, URL, upload e biografia. | `frontend/src/app/pages/publicar/publicar.component.{ts,html,css}`, `frontend/src/app/pages/perfil/perfil.component.{ts,html,css}`. |
| 10. Consistência e acessibilidade | Acesso e quatro páginas educativas integrados ao mesmo sistema; estilos educativos compartilhados. | `frontend/src/app/pages/acesso/acesso.component.{ts,html,css}`, `frontend/src/app/pages/education-page.css`, arquivos `.ts` e `.html` de `democracia`, `desinformacao`, `checagem` e `direitos-trabalhistas`. |
| 11. Validação | Testes de navegação, foco, destaques reais, filtros e confirmação do desafio diário; revisão em navegador. | `frontend/src/app/app.spec.ts`, `frontend/src/app/components/header/header.component.spec.ts`, `frontend/src/app/pages/home/home.component.spec.ts`, `frontend/src/app/pages/community.spec.ts`, `frontend/src/app/pages/quiz/quiz.component.spec.ts`. Os testes existentes de publicação e perfil também foram executados. |

Assets adicionados: `frontend/public/illustrations/student-hero.webp`,
`frontend/public/illustrations/learning-together.webp` e as oito variantes WebP em
`frontend/public/avatars/portrait-01.webp` a `portrait-08.webp`.
Origem, caminhos e prompts estão em [ASSETS_VISUAIS.md](ASSETS_VISUAIS.md).

## Contratos e comportamento preservados

- Backend Django, migrações, banco real, autenticação, serviços de quiz, rotas e
  endereços da API mantidos. Nenhuma dependência adicionada ao frontend.
- Publicações de destaque e resultados vêm de `/posts/`. Não há posts de exemplo
  embutidos no código da aplicação. Sem dados, são apresentados estados vazios.
- As quatro páginas educativas e as cinco categorias de publicação permanecem
  conjuntos distintos. Checagem não foi adicionada ao enum de posts da API.
- Upload de publicação: até 20 MB; foto de perfil: até 5 MB. Formatos e envio
  multipart existentes preservados. Fotos e vídeos continuam com prévia e
  controles nativos; posts sem mídia continuam possíveis.
- Likes, comentários, exclusão pelo autor e autenticação continuam usando os
  endpoints existentes. Não foi criado compartilhamento, pois não havia essa ação.
- Vidas, XP, aprovação e desbloqueio são sempre recebidos da API. O frontend não
  concede pontos nem calcula novas regras. O percentual da trilha apenas apresenta
  a proporção dos níveis já concluídos.
- O aviso de desafio diário concluído aparece após aprovação confirmada pela API
  durante a sessão atual da tela. O contrato atual não devolve um indicador de
  conclusão diária persistido na listagem; esse estado não foi inventado ao abrir
  a página novamente.
- A marca existente em CSS foi preservada e reutilizada. Não foi encontrado um
  arquivo gráfico original do logotipo no repositório. As novas ilustrações são
  decorativas e não representam integrantes reais da equipe.

## Verificações concluídas

Na pasta `frontend`:

```powershell
npm test -- --watch=false
npm run build -- --base-href /Cidadania-na-Escola/
```

- **36 testes passaram em 7 arquivos** na execução final.
- Build de produção concluído, sem alertas de orçamento. Pacote inicial:
  **351,96 kB**, transferência estimada pelo Angular em **89,07 kB**. As imagens
  são assets separados desses valores.
- `git diff --check` sem problemas. Todas as referências a variáveis CSS possuem
  definição. Não há mudanças no diretório `backend`.
- As 12 rotas foram conferidas em **320, 768 e 1280 px**, todas com um único
  elemento `main`, título e sem rolagem horizontal da página.
- Hero também conferido em **390 px**; imagens e links relativos funcionam no
  build servido sob `/Cidadania-na-Escola/`.
- Menu mobile: abertura, fechamento, Escape e retorno de foco conferidos.
  Há rótulos associados, mensagens de status/erro, seleção textual dos estados,
  foco visível e suporte a movimento reduzido.
- Navegador sem erros ou avisos de console durante a revisão local final.

Os testes de integração no navegador utilizaram uma **API Django local com banco
e mídia descartáveis fora do repositório**, criados apenas para a revisão. A base
real e a API de produção não receberam as publicações nem o progresso de teste.

Fluxos conferidos nessa base:

1. Login e saída usando os endpoints existentes.
2. Avanço de um card no carrossel, com atualização dos controles.
3. Busca simultânea por texto/categoria, resultado correto e pesquisa vazia.
4. Curtida com atualização imediata da contagem; abertura, estado vazio e envio de
   comentário com atualização do feed.
5. Publicação: erros obrigatórios, seleção de WebP, prévia, upload multipart,
   redirecionamento e confirmação após cadastro real na API local.
6. Perfil: ilustração e bio salvas, persistência após recarregar; URL de imagem
   salva e recarregada. Upload e rejeição de formato inválido também cobertos pelos
   testes automatizados do perfil.
7. Quiz: conclusão de três perguntas, 30 XP confirmados pelo backend, próximo
   nível desbloqueado; resposta incorreta consumiu uma vida e mostrou explicação.
   O teste automatizado adicional cobre a confirmação do desafio diário.

Google OAuth e geração externa por IA não receberam novos contratos nem novas
configurações. A validação local usou o banco educativo existente, com esses
serviços externos desativados apenas no processo descartável de teste.

Na consulta final da prévia local do build de produção, a chamada dos destaques
à API externa configurada não foi concluída e a interface mostrou a opção de
tentar novamente. A causa externa não foi determinada nesta revisão; a consulta
de posts e as operações autenticadas foram verificadas com a API local isolada.
Esse limite da prévia não foi contornado com publicações fictícias na aplicação.

## Revisão local

A prévia de produção permanece acessível em
`http://127.0.0.1:4300/Cidadania-na-Escola/` enquanto o servidor de revisão estiver
ativo. Para desenvolvimento habitual, iniciar o backend existente e executar
`npm start` dentro de `frontend`. O frontend mantém as configurações originais de
API para desenvolvimento e produção.

Nenhum deploy ou commit foi realizado nesta etapa.
