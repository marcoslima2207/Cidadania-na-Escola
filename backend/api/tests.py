from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Conteudo, Pergunta, Post, Resultado

User = get_user_model()


# TESTES DE API: conteudo, autenticacao, posts e interacoes sociais.
class ApiEndpointsTests(APITestCase):
    def setUp(self):
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

    def test_list_conteudos(self):
        response = self.client.get(reverse('conteudo-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

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

    def test_list_perguntas(self):
        response = self.client.get(reverse('pergunta-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

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

    def test_login_returns_token(self):
        response = self.client.post(
            reverse('auth-login'),
            {'username': 'aluno', 'password': '12345678'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_register_creates_user_and_returns_token(self):
        response = self.client.post(
            reverse('auth-register'),
            {'name': 'Nova Pessoa', 'email': 'nova@email.com', 'password': '12345678'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(email='nova@email.com').exists())

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
