# Verifica os contratos da API usando banco e pasta de mídia temporários, sem alterar os dados reais.
from django.contrib.auth import get_user_model
import base64
import tempfile
from io import BytesIO
from PIL import Image
from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Conteudo, Pergunta, Post, Profile, Resultado

User = get_user_model()


# TESTES DE API: conteudo, autenticacao, posts e interacoes sociais.
# Usa um hash rápido somente neste conjunto de testes; não altera as senhas em produção.
@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class ApiEndpointsTests(APITestCase):
    # Prepara mídia temporária, conteúdo, pergunta e usuário para cada teste independente.
    def setUp(self):
        # Uploads de teste ficam isolados e são removidos automaticamente após cada caso.
        self.media_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.media_dir.cleanup)
        media_settings = override_settings(MEDIA_ROOT=self.media_dir.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)
        self.conteudo = Conteudo.objects.create(
            titulo='Democracia e participação',
            descricao='Como a participação cidadã fortalece a democracia',
            categoria='democracia',
            conteudo='O cidadão participa e acompanha as decisões públicas.',
        )
        self.pergunta = Pergunta.objects.create(
            enunciado='Qual é a melhor forma de combater a desinformação?',
            opcao_a='Verificar fontes e checar fatos antes de compartilhar',
            opcao_b='Compartilhar sem validar',
            opcao_c='Acreditar em qualquer mensagem viral',
            alternativa_correta='a',
            categoria='desinformacao',
        )
        self.user = User.objects.create_user(
            username='aluno',
            email='aluno@email.com',
            password='12345678'
        )

    def avatar_upload(self, name="foto.jpg"):
        output = BytesIO()
        Image.new("RGB", (20, 20), "blue").save(output, "JPEG")
        return SimpleUploadedFile(name, output.getvalue(), content_type="image/jpeg")

    def test_favorites_are_private_and_independent_of_likes(self):
        other = User.objects.create_user(username="outra")
        own = Post.objects.create(user=self.user, title="Minha", content="Texto", category="Cidadania")
        post = Post.objects.create(user=other, title="Outra", content="Texto", category="Cidadania")
        url = reverse("post-favorite", args=[post.id])
        self.assertEqual(self.client.put(url).status_code, 401)
        self.assertEqual(self.client.get(reverse("post-list"), {"lista": "favoritos"}).status_code, 401)
        self.client.force_authenticate(self.user)
        for _ in range(2):
            self.assertTrue(self.client.put(url).data["saved_by_me"])
        favorite = self.client.get(reverse("post-list"), {"lista": "favoritos"}).data
        self.assertEqual([item["id"] for item in favorite], [post.id])
        self.assertEqual(favorite[0]["likes_count"], 0)
        own_posts = self.client.get(reverse("post-list"), {"lista": "minhas"}).data
        self.assertEqual([item["id"] for item in own_posts], [own.id])
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get(reverse("post-list"), {"lista": "favoritos"}).data, [])
        self.client.force_authenticate(self.user)
        self.assertFalse(self.client.delete(url).data["saved_by_me"])
        self.assertEqual(self.client.get(reverse("post-list"), {"lista": "favoritos"}).data, [])

    def test_avatar_survives_logout_and_new_login_without_media_disk(self):
        def login():
            response = self.client.post(reverse("auth-login"), {"username": "aluno", "password": "12345678"})
            self.client.credentials(HTTP_AUTHORIZATION="Token " + response.data["token"])

        login()
        url = reverse("auth-profile")
        photo = self.client.patch(url, {"avatar_file": self.avatar_upload()}, format="multipart").data["avatar_file_url"]
        self.assertFalse(Profile.objects.get(user=self.user).avatar_file)
        self.assertEqual(self.client.post(reverse("auth-logout")).status_code, 204)
        self.client.credentials()
        self.assertEqual(self.client.get(photo)["Content-Type"], "image/webp")
        login()
        self.assertEqual(self.client.get(url).data["avatar_file_url"], photo)
        self.assertEqual(self.client.patch(url, {"avatar_choice": "portrait01"}).data["avatar_file_url"], "")
        self.assertEqual(self.client.get(photo).status_code, 404)

    def test_media_only_posts_accept_photo_and_video_without_written_fields(self):
        self.client.force_authenticate(self.user)
        for name, data, mime in [
            ('foto.png', b'\x89PNG\r\n\x1a\n' + b'0' * 32, 'image/png'),
            ('video.mp4', b'\x00\x00\x00\x18ftypmp42' + b'0' * 32, 'video/mp4'),
        ]:
            with self.subTest(name=name):
                response = self.client.post(
                    reverse('post-list'),
                    {'category': 'Cidadania', 'media_file': SimpleUploadedFile(name, data, content_type=mime)},
                    format='multipart',
                )
                self.assertEqual(response.status_code, 201, response.data)
                self.assertEqual(response.data['title'], '')
                self.assertEqual(response.data['content'], '')
                self.assertTrue(response.data['media_url'])

    def test_no_media_still_requires_title_and_text(self):
        self.client.force_authenticate(self.user)
        for payload in [
            {'category': 'Cidadania'},
            {'category': 'Cidadania', 'title': '  ', 'content': '  '},
        ]:
            response = self.client.post(reverse('post-list'), payload, format='json')
            self.assertEqual(response.status_code, 400)
            self.assertIn('title', response.data)
            self.assertIn('content', response.data)
        self.assertEqual(Post.objects.count(), 0)

    # Confere se os materiais educativos podem ser consultados.
    def test_list_conteudos(self):
        response = self.client.get(reverse('conteudo-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    # Confere o cadastro de um conteúdo e a inclusão de um registro no banco.
    def test_create_conteudo(self):
        payload = {
            'titulo': 'Direitos trabalhistas',
            'descricao': 'Direitos básicos do trabalhador',
            'categoria': 'trabalhista',
            'conteudo': 'Trabalho digno e respeito às leis trabalhistas.'
        }
        response = self.client.post(reverse('conteudo-list'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conteudo.objects.count(), 2)

    # Confere se a API retorna as perguntas cadastradas.
    def test_list_perguntas(self):
        response = self.client.get(reverse('pergunta-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    # Confere o registro de pontuação e respostas de uma tentativa do quiz.
    def test_create_resultado(self):
        payload = {
            'nome': 'Aluno',
            'pontuacao': 8,
            'total_perguntas': 10,
            'resultado': 'Bom nível de compreensão',
            'respostas': {'1': 'a', '2': 'b'}
        }
        response = self.client.post(reverse('resultado-list'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Resultado.objects.count(), 1)

    # Confere se credenciais válidas devolvem um token de acesso.
    def test_login_returns_token(self):
        response = self.client.post(
            reverse('auth-login'),
            {'username': 'aluno', 'password': '12345678'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    # Confere a criação da conta e a emissão de seu token inicial.
    def test_register_creates_user_and_returns_token(self):
        response = self.client.post(
            reverse('auth-register'),
            {'name': 'Nova Pessoa', 'email': 'nova@email.com', 'password': '12345678'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(email='nova@email.com').exists())

    # Confere o cadastro de um post usando um token válido.
    def test_create_post_requires_auth(self):
        login_response = self.client.post(
            reverse('auth-login'),
            {'username': 'aluno', 'password': '12345678'},
            format='json'
        )
        token = login_response.data['token']

        payload = {
            'title': 'Direitos e dignidade no trabalho',
            'category': 'Direitos Trabalhistas',
            'content': 'Trabalho digno é direito de toda pessoa.',
            'media_type': 'image',
            'media_url': 'https://example.com/post.jpg'
        }

        response = self.client.post(
            reverse('post-list'),
            payload,
            format='json',
            HTTP_AUTHORIZATION=f'Token {token}'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # Confere o upload multipart de uma imagem e o endereço retornado pela API.
    def test_create_post_with_real_media_upload(self):
        login_response = self.client.post(
            reverse('auth-login'),
            {'username': 'aluno', 'password': '12345678'},
            format='json'
        )
        image = SimpleUploadedFile('cidadania.png', base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII='), content_type='image/png')
        response = self.client.post(
            reverse('post-list'),
            {
                'title': 'Imagem da comunidade',
                'category': 'Cidadania',
                'content': 'Publicação com upload real.',
                'media_type': 'image',
                'media_file': image,
            },
            format='multipart',
            HTTP_AUTHORIZATION=f"Token {login_response.data['token']}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        uploaded_post = Post.objects.get(id=response.data['id'])
        self.assertTrue(uploaded_post.media_file.name)
        self.assertIn('/media/posts/', response.data['media_url'])

    # Confere a criação de curtida e comentário usando uma sessão autenticada.
    def test_post_like_and_comment(self):
        post = Post.objects.create(
            user=self.user,
            title='Participação cidadã',
            category='Cidadania',
            content='Participar também é transformar.',
        )
        login_response = self.client.post(reverse('auth-login'), {'username': 'aluno', 'password': '12345678'}, format='json')
        token = login_response.data['token']
        headers = {'HTTP_AUTHORIZATION': f'Token {token}'}

        like_response = self.client.post(reverse('post-like', args=[post.id]), {}, format='json', **headers)
        comment_response = self.client.post(reverse('post-comments', args=[post.id]), {'content': 'Concordo!'}, format='json', **headers)

        self.assertEqual(like_response.status_code, status.HTTP_200_OK)
        self.assertEqual(comment_response.status_code, status.HTTP_201_CREATED)

    # Confere se a API impede excluir o post de outra pessoa.
    def test_user_cannot_delete_another_users_post(self):
        other_user = User.objects.create_user(username='outra', email='outra@email.com', password='12345678')
        post = Post.objects.create(user=other_user, title='Post de outra pessoa', category='Cidadania', content='Conteúdo')
        login_response = self.client.post(reverse('auth-login'), {'username': 'aluno', 'password': '12345678'}, format='json')
        response = self.client.delete(
            reverse('post-detail', args=[post.id]),
            HTTP_AUTHORIZATION=f"Token {login_response.data['token']}"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Post.objects.filter(id=post.id).exists())

    # Confere se a API impede editar o post de outra pessoa.
    def test_other_author_cannot_edit_post(self):
        other = User.objects.create_user(username='professor', password='12345678')
        post = Post.objects.create(user=other, title='Original', category='Cidadania', content='Texto')
        self.client.force_authenticate(self.user)
        response = self.client.patch(reverse('post-detail', args=[post.id]), {'title': 'Alterado'}, format='json')
        self.assertEqual(response.status_code, 403)
        post.refresh_from_db()
        self.assertEqual(post.title, 'Original')

    # Confere busca sem acentos e maiúsculas e a combinação com categoria.
    def test_search_and_category_filters(self):
        Post.objects.create(user=self.user, title='Educação cidadã', category='Educação', content='Participação')
        Post.objects.create(user=self.user, title='Outro assunto', category='Democracia', content='Eleições')
        response = self.client.get(reverse('post-list'), {'search': 'EDUCACAO'})
        self.assertEqual(len(response.data), 1)
        response = self.client.get(reverse('post-list'), {'search': 'participacao', 'category': 'Democracia'})
        self.assertEqual(response.data, [])

    # Confere leitura pública, autenticação para reagir e remoção da curtida.
    def test_public_comments_and_authenticated_reaction_state(self):
        other = User.objects.create_user(username='outro', password='12345678')
        post = Post.objects.create(user=other, title='Discussão', category='Cidadania', content='Texto')
        self.assertEqual(self.client.get(reverse('post-comments', args=[post.id])).status_code, 200)
        self.assertEqual(self.client.post(reverse('post-like', args=[post.id])).status_code, 401)
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse('post-like', args=[post.id]))
        self.assertTrue(response.data['liked'])
        response = self.client.get(reverse('post-list'))
        self.assertTrue(response.data[0]['liked_by_me'])
        self.assertFalse(response.data[0]['is_mine'])
        response = self.client.post(reverse('post-like', args=[post.id]))
        self.assertFalse(response.data['liked'])
        self.assertEqual(response.data['likes_count'], 0)

    # Confere a rejeição de arquivo vazio, formato proibido, assinatura falsa e tamanho excessivo.
    def test_upload_validation(self):
        self.client.force_authenticate(self.user)
        payload = {'title': 'Arquivo', 'content': 'Texto', 'category': 'Cidadania'}
        for name, content, mime in [('teste.svg', b'<svg/>', 'image/svg+xml'), ('falso.png', b'<html>erro</html>', 'image/png'), ('vazio.png', b'', 'image/png')]:
            response = self.client.post(reverse('post-list'), {**payload, 'media_file': SimpleUploadedFile(name, content, content_type=mime)}, format='multipart')
            self.assertEqual(response.status_code, 400)
        oversized = SimpleUploadedFile('grande.png', b'\x89PNG\r\n\x1a\n' + b'0' * (20 * 1024 * 1024), content_type='image/png')
        response = self.client.post(reverse('post-list'), {**payload, 'media_file': oversized}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Post.objects.count(), 0)

    # Confere upload de vídeo, leitura parcial e bloqueio de acesso fora da pasta de mídia.
    def test_video_upload_and_media_download(self):
        self.client.force_authenticate(self.user)
        content = b'\x00\x00\x00\x18ftypmp42' + b'\x00' * 20
        response = self.client.post(reverse('post-list'), {'title': 'Vídeo', 'content': 'Texto', 'category': 'Cidadania', 'media_file': SimpleUploadedFile('video.mp4', content, content_type='video/mp4')}, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['media_type'], 'video')
        post = Post.objects.get(id=response.data['id'])
        download = self.client.get(reverse('uploaded-media', args=[post.media_file.name]))
        self.assertEqual(download.status_code, 200)
        self.assertEqual(b''.join(download.streaming_content), content)
        partial = self.client.get(reverse('uploaded-media', args=[post.media_file.name]), HTTP_RANGE='bytes=4-7')
        self.assertEqual(partial.status_code, 206)
        self.assertEqual(b''.join(partial.streaming_content), b'ftyp')
        invalid = self.client.get(reverse('uploaded-media', args=[post.media_file.name]), HTTP_RANGE='bytes=999-')
        self.assertEqual(invalid.status_code, 416)
        self.assertEqual(self.client.get('/media/../config/settings.py').status_code, 404)

    # Confere a compatibilidade das publicações antigas que usam uma URL externa.
    def test_external_media_link_is_preserved(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse('post-list'), {'title': 'Legado', 'content': 'Texto', 'category': 'Cidadania', 'media_url': 'https://example.com/foto.jpg'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['media_url'], 'https://example.com/foto.jpg')

    # A foto do perfil é gravada e usada também nas publicações do seu autor.
    def test_profile_upload_is_displayed_in_community(self):
        self.client.force_authenticate(self.user)
        photo = self.avatar_upload('foto.jfif')
        response = self.client.patch(reverse('auth-profile'), {'bio': 'Minha bio', 'avatar_file': photo}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['avatar_file_url'].startswith('http://testserver/media/avatars/'))
        self.assertNotIn('avatar_file', response.data)
        self.assertEqual(response.data['bio'], 'Minha bio')
        Post.objects.create(user=self.user, title='Post', category='Cidadania', content='Texto')
        feed = self.client.get(reverse('post-list'))
        self.assertEqual(feed.data[0]['author_profile']['avatar_url'], response.data['avatar_file_url'])

    # JFIF é JPEG: o formato das imagens fornecidas também precisa ser aceito nas publicações.
    def test_post_accepts_jfif_upload(self):
        self.client.force_authenticate(self.user)
        image = SimpleUploadedFile('imagem.JFIF', b'\xff\xd8\xff' + b'0' * 32, content_type='image/jpeg')
        response = self.client.post(reverse('post-list'), {'title': 'Foto da escola', 'content': 'Atividade', 'category': 'Cidadania', 'media_type': 'image', 'media_file': image}, format='multipart')
        self.assertEqual(response.status_code, 201)
        post = Post.objects.get(id=response.data['id'])
        self.assertTrue(post.media_file.storage.exists(post.media_file.name))
        self.assertIn('/media/posts/', response.data['media_url'])

    # Escolher uma ilustração precisa substituir a foto antiga em vez de ficar escondida por ela.
    def test_profile_illustration_replaces_photo_and_preserves_account(self):
        self.client.force_authenticate(self.user)
        photo = self.avatar_upload('foto.jpg')
        profile, _ = Profile.objects.get_or_create(user=self.user)
        profile.avatar_file.save(photo.name, photo)
        old_file = profile.avatar_file
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(reverse('auth-profile'), {'avatar_choice': 'portrait07', 'username': 'fraude', 'email': 'fraude@example.com'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['avatar_file_url'], '')
        self.assertEqual(response.data['avatar_url'], '')
        self.assertEqual(response.data['avatar_choice'], 'portrait07')
        self.assertFalse(old_file.storage.exists(old_file.name))
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'aluno')

    # Valida autenticação, tipos de imagem, tamanho máximo e remoção das escolhas antigas.
    def test_profile_upload_validation_and_choices(self):
        self.assertEqual(self.client.patch(reverse('auth-profile'), {'bio': 'Não autorizado'}, format='json').status_code, 401)
        self.client.force_authenticate(self.user)
        for name, data, mime in [('arquivo.svg', b'<svg/>', 'image/svg+xml'), ('falso.png', b'\x89PNG\r\n\x1a\n' + b'<html/>', 'image/png'), ('vazio.jpg', b'', 'image/jpeg'), ('grande.jpg', b'\xff\xd8\xff' + b'0' * (5 * 1024 * 1024), 'image/jpeg')]:
            response = self.client.patch(reverse('auth-profile'), {'avatar_file': SimpleUploadedFile(name, data, content_type=mime)}, format='multipart')
            self.assertEqual(response.status_code, 400)
        for old in ['sun', 'leaf', 'star', 'book']:
            self.assertEqual(self.client.patch(reverse('auth-profile'), {'avatar_choice': old}, format='json').status_code, 400)
        for choice, _ in Profile.AVATAR_CHOICES:
            response = self.client.patch(reverse('auth-profile'), {'avatar_choice': choice}, format='json')
            self.assertEqual(response.status_code, 200)

    # Atualizar somente a bio mantém a foto; um link escolhido depois substitui o upload.
    def test_profile_bio_preserves_photo_and_url_replaces_upload(self):
        self.client.force_authenticate(self.user)
        photo = self.avatar_upload('foto.jpg')
        uploaded = self.client.patch(reverse('auth-profile'), {'avatar_file': photo}, format='multipart')
        bio = self.client.patch(reverse('auth-profile'), {'bio': 'Bio atualizada'}, format='json')
        self.assertEqual(bio.data['avatar_file_url'], uploaded.data['avatar_file_url'])
        response = self.client.patch(reverse('auth-profile'), {'avatar_url': 'https://example.com/foto.jpg'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['avatar_file_url'], '')
        self.assertEqual(response.data['avatar_url'], 'https://example.com/foto.jpg')
