# Ativar o Clerk no site publicado

O site usa GitHub Pages no frontend e Render na API. A aplicação Clerk existente
é “Cidadania na Escola” (`app_3LFggxIee14Wn1b0TIZ7fwKk32O`).
A instância Production ainda precisa ser criada depois da escolha do domínio.

## 1. Resgatar um domínio

O GitHub Student Developer Pack oferece benefícios de domínio. Acesse
[Name.com para estudantes GitHub](https://www.name.com/partner/github-students),
entre com a conta GitHub aprovada e confira os domínios incluídos no benefício.
Confira o valor da renovação e os itens do carrinho antes de concluir o resgate.
Não é necessário contratar hospedagem: o projeto já tem GitHub Pages e Render.

Anote o domínio exato escolhido e mantenha acesso ao seu painel de DNS.

## 2. Configurar o domínio no GitHub Pages

No repositório `marcoslima2207/Cidadania-na-Escola`, abra **Settings → Pages →
Custom domain**, informe o domínio e salve. Em seguida crie os registros DNS
indicados pela documentação do GitHub. Para um subdomínio `www`, o CNAME aponta
para `marcoslima2207.github.io`, sem o nome do repositório.

Espere a validação DNS e habilite **Enforce HTTPS**. O workflow usa o endereço base
informado pelo GitHub Pages: `/Cidadania-na-Escola/` no endereço original e `/` no
domínio próprio. Não é preciso editar as rotas Angular para essa mudança.

## 3. Criar e validar a instância Production no Clerk

Dentro de `frontend`, no seu terminal, execute:

```powershell
npx -y clerk@latest deploy
```

Selecione o domínio escolhido e siga os passos do CLI. Ele informa os registros
DNS necessários para sessões, e-mails e certificados. Adicione exatamente os
valores exibidos ao DNS do seu domínio. Também é possível fazer a configuração
pelo painel Clerk, no seletor **Development → Create production instance**.

Para conferir o que ainda falta:

```powershell
npx -y clerk@latest deploy status
```

Google e LinkedIn precisam de credenciais OAuth próprias em produção. Copie os
endereços de retorno fornecidos pelo Clerk para os respectivos provedores e
cadastre as credenciais no painel Clerk. As conexões e os caminhos precisam ser
conferidos na instância Production; não presuma que foram copiados de Development.
Mantenha os caminhos de login e cadastro em `/acesso` e `/acesso/cadastro` no site.

## 4. Configurar a API no Render

No Render, abra o serviço **cidadania-na-escola-api → Environment**.
Use os valores da instância Production do Clerk:

| Variável | Valor |
| --- | --- |
| `CLERK_ENABLED` | `true` |
| `CLERK_SECRET_KEY` | Chave secreta `sk_live_...`, somente no Render |
| `CLERK_ISSUER` | URL Frontend API da instância Production, com `https://` |
| `CLERK_AUTHORIZED_PARTIES` | Origem HTTPS do site, sem caminho nem barra final |
| `CORS_ALLOWED_ORIGINS` | Origens autorizadas, separadas por vírgula |

Por exemplo, se o site definitivo for `https://www.seu-dominio.com`, esse é o
valor de `CLERK_AUTHORIZED_PARTIES`. Para CORS, mantenha a origem GitHub já existente
e acrescente a nova: `https://marcoslima2207.github.io,https://www.seu-dominio.com`.
Esse domínio é apenas um exemplo: use o domínio resgatado e a origem escolhida.

O Render deve usar o commit com a integração Clerk. O build já executa
`python manage.py migrate` para criar a tabela de identidades. Salve as variáveis
e faça o redeploy da API antes de ativar o frontend de produção.

Não copie a chave secreta para arquivos públicos, variáveis públicas do GitHub,
código Angular ou mensagens do chat.

## 5. Ativar o frontend no GitHub

Abra o repositório em **Settings → Secrets and variables → Actions → Variables**.
Crie uma variável de repositório:

| Nome | Valor |
| --- | --- |
| `CLERK_PUBLISHABLE_KEY` | Chave pública Production `pk_live_...` |

Apenas essa chave pública é necessária no GitHub. O workflow a injeta na
compilação e recusa chaves de desenvolvimento nessa etapa. Sem essa variável,
ele mantém a configuração anterior. A chave secreta nunca é consumida pelo build.

Execute **Actions → Deploy Angular to GitHub Pages → Run workflow**. Confira se
o build e a publicação terminam com sucesso, então abra o domínio HTTPS.

## 6. Validar com uma conta nova

Conforme a escolha do usuário, as contas locais não serão importadas nesta etapa.
Cadastre uma conta nova na instância Production e teste confirmação de e-mail,
login, perfil, recuperação de senha, Google e as operações da comunidade/quiz.
As contas de Development são separadas das contas de Production.

As contas anteriores continuam no banco Django. Não faça importação de e-mails
ou hashes e não desligue o acesso anterior sem definir e autorizar a transição
dessas contas. Associar contas apenas por coincidência de e-mail não é permitido.
O corte definitivo (`LEGACY_AUTH_ENABLED=false`) depende desse plano e da validação.

## Referências oficiais

- [Benefício de domínio Name.com](https://www.name.com/partner/github-students)
- [Domínio próprio no GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Produção Clerk](https://clerk.com/docs/guides/development/deployment/production)
- [Variáveis no Render](https://render.com/docs/configure-environment-variables)
