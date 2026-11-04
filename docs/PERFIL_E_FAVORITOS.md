# Perfil e favoritos

O menu da conta consulta o perfil autenticado em `/api/auth/profile/`. A edição
de perfil reutiliza o mesmo serviço Angular, e a resposta do salvamento atualiza
a foto no menu. As opções **Meus conteúdos** e **Favoritos** reutilizam a
comunidade; os filtros são aplicados no Django para o usuário da sessão.
Salvar uma publicação é independente de curti-la. As configurações de senha
ficam no painel do Clerk quando esse provedor está ativo.

Fotos novas são validadas pelo Pillow, limitadas a 5 MB e 16 megapixels no envio
e convertidas para WebP de até 512 × 512. O arquivo reduzido fica no mesmo banco
do perfil (SQLite local, PostgreSQL no Render), com URL pública própria para
exibição no cabeçalho e na comunidade. A troca e a remoção invalidam o endereço
anterior. Fotos antigas em disco continuam legíveis enquanto o arquivo existir;
para torná-las independentes do disco, envie a foto novamente. Esta mudança
não altera o armazenamento de fotos e vídeos anexados às publicações.

Na instalação local, instale as dependências de `backend/requirements.txt`
e rode `python manage.py migrate` no backend. No Render, o comando de build
existente instala as dependências e aplica a migração
`0012_persistent_avatar_and_favorites`. Publique a API com a migração antes
do frontend que usa favoritos. Não é necessário provisionar um disco para
as novas fotos de perfil.
