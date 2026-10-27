# Autenticação Clerk — desenvolvimento e transição

A aplicação Clerk selecionada é `app_3LFggxIee14Wn1b0TIZ7fwKk32O` (Cidadania na Escola).
O frontend continua em Angular e o backend em Django. O SDK JavaScript oficial foi
integrado manualmente porque o CLI não detectou Angular. As configurações existentes
de e-mail, senha e provedores sociais foram preservadas.

## Desenvolvimento local

O CLI foi vinculado à aplicação existente. As chaves de desenvolvimento ficam em
`backend/.env.clerk.local`, ignorado pelo Git. Não copie seu conteúdo para commits,
chats ou código do frontend. Para restaurar esse arquivo em outra máquina, entre
no CLI no seu terminal e execute, dentro de `frontend`:

```powershell
npx -y clerk@latest auth login
npx -y clerk@latest link --app app_3LFggxIee14Wn1b0TIZ7fwKk32O
npx -y clerk@latest env pull --instance dev --file ../backend/.env.clerk.local
npm run clerk:configure
npm run clerk:backend -- migrate
npm run clerk:backend
```

Em outro terminal, dentro de `frontend`, execute `npm start` e abra
`http://localhost:4200/acesso`. O backend deve estar em `http://localhost:8000`.
`clerk:configure` escreve somente a chave pública em `src/app/clerk-config.ts`.
`clerk:backend` injeta as chaves no processo Python, habilita Clerk localmente e
deriva o emissor a partir da chave pública. Esses comandos aceitam apenas chaves
de teste. Não é necessário colocar a chave secreta em nenhuma configuração Angular.

As chaves `pk_test_` só ativam Clerk em localhost/127.0.0.1/IPv6 local.
Assim, publicar um build com a configuração de teste não troca o login do site público.

## Como as sessões funcionam

O Angular pede um JWT atualizado ao SDK antes de cada chamada à API configurada.
O token vai em `Authorization: Bearer`; não é salvo no localStorage nem enviado
para hosts de imagens ou outras APIs. Quando Clerk está desativado, o contrato
`Authorization: Token` continua funcionando.

O Django valida assinatura RS256, emissor configurado, expiração, datas, origem
autorizada, ID de sessão e status. O endereço JWKS vem da configuração do servidor,
jamais de um emissor escolhido pelo token. Os JWTs do Clerk têm validade curta;
a revogação de uma sessão passa a valer para a API quando seu último JWT expira.

`ClerkIdentity` relaciona `(issuer, subject)` ao usuário Django. Perfis, publicações,
comentários e progresso continuam com seus IDs e relacionamentos originais.
A confirmação de e-mail é exigida ao criar um vínculo novo. Contas com e-mails
iguais não são associadas automaticamente: contas antigas precisam ser importadas
com `external_id=django:<id>`, definido exclusivamente pelo backend administrativo.

O formulário do Clerk oferece cadastro, verificação e recuperação de senha.
Login e cadastro ficam incorporados nas rotas `/acesso` e `/acesso/cadastro`,
com links entre elas no próprio site e interface em português.
No perfil, “E-mail e segurança da conta” abre a gestão de e-mails, senhas e
conexões sociais. Esses dados de identidade são gerenciados pelo Clerk; as
preferências e os dados comunitários continuam no Django.

## Migração das contas existentes

Dentro de `frontend`:

```powershell
# Simulação: não envia dados nem altera usuários.
npm run clerk:backend -- migrate_clerk_users

# Importação explícita para a instância de desenvolvimento configurada.
npm run clerk:backend -- migrate_clerk_users --apply

# Opcional: limitar a uma conta local específica.
npm run clerk:backend -- migrate_clerk_users --user-id 123 --apply
```

A importação exclui contas inativas, staff e superusuários. Valida o lote antes de
enviar, recusa e-mails duplicados ou inválidos e hashes não suportados. Preserva
hashes `pbkdf2_sha256` usando `password_hasher=pbkdf2_sha256_django`; não conhece
nem recupera senhas em texto. Contas sem senha permanecem sem senha na importação.
Usernames com 4–64 caracteres ASCII compatíveis são preservados; os demais recebem
um identificador Clerk `aluno_<id>`, mantendo seu nome e username locais.

O comando procura o external_id antes de criar a conta e pode ser repetido após
uma interrupção. Conflitos remotos e falhas de rede interrompem a operação sem
sobrescrever identidades existentes. Após resolver a causa (ou aguardar o limite
de requisições), execute novamente. A tabela local separa emissores de teste e
produção. O comando não imprime e-mails, hashes ou chaves.

Antes de testar: uma conta já cadastrada no Django precisa estar importada.
Caso contrário, entrar pelo mesmo e-mail será recusado para evitar vínculos indevidos.
Contas novas são criadas localmente no primeiro acesso autenticado à API.

## Validação manual

1. Abra `/acesso` e entre com uma conta importada ou cadastre uma conta de teste.
2. Confirme o código recebido por e-mail e confira se o perfil carrega.
3. Saia, escolha recuperar a senha e conclua o código e a nova senha.
4. Confira o login Google e a preservação dos dados da conta importada.
5. Publique, interaja na comunidade e confira o progresso do quiz.
6. No perfil, confira “E-mail e segurança da conta” e teste sair e entrar novamente.

Os testes automatizados usam banco isolado, tokens assinados com chaves de teste
e sessões simuladas. Eles não criam usuários no Clerk nem enviam e-mails reais.

## Produção — etapa posterior à validação

O [guia de produção](CLERK_PRODUCAO.md) detalha domínio, DNS, Render e a variável
pública `CLERK_PUBLISHABLE_KEY` do GitHub Actions. O workflow ajusta o endereço
base ao domínio configurado no Pages e injeta somente chaves públicas `pk_live_`.

Crie a instância Production no painel Clerk e configure um domínio próprio, os
registros DNS, os e-mails e suas próprias credenciais OAuth Google. Não é possível
copiar usuários de Development para Production: importe diretamente do Django
de produção para a instância final.

No Render configure `CLERK_ENABLED=true`, `CLERK_SECRET_KEY` (sk_live_),
`CLERK_ISSUER` (URL Frontend API de produção) e `CLERK_AUTHORIZED_PARTIES`
(origem HTTPS do frontend, sem caminho). Configure a chave `pk_live_` correspondente
em `clerk-config.ts`, aplique as migrações Django e compile o frontend.

Faça backup e coordene a importação com a troca de login para evitar alterações
de senhas/cadastros entre o snapshot e o corte. Depois da importação e dos testes,
defina `LEGACY_AUTH_ENABLED=false`: isso bloqueia os endpoints antigos de
cadastro/login/Google e a aceitação de tokens Django. Os usuários precisarão entrar
novamente com o Clerk. O admin Django continua com sua autenticação própria.

Não mantenha acesso antigo em produção depois do corte: uma recuperação de senha
no Clerk não altera a senha Django antiga. Para voltar ao provedor anterior depois
de mudanças de senha, planeje uma nova recuperação/revalidação de credenciais;
simplesmente reabrir os endpoints antigos restaura senhas antigas.

## Referências

- [SDK JavaScript oficial](https://clerk.com/docs/js-frontend/getting-started/quickstart)
- [Migração e external IDs](https://clerk.com/docs/guides/development/migrating/overview)
- [Verificação de JWTs](https://clerk.com/docs/guides/sessions/manual-jwt-verification)
- [Produção e domínio](https://clerk.com/docs/guides/development/deployment/production)
