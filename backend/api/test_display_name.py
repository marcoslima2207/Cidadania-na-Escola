from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Post, PostComment
from .serializers import PostCommentSerializer, PostSerializer
from .views import auth_response


class DisplayNameTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="google_3c0d6272c6a9a5eaca143583",
            first_name="Marcos Eduardo",
            password=None,
        )
        self.client.force_authenticate(self.user)

    def test_existing_google_account_exposes_saved_name_without_renaming_user(self):
        session = auth_response(self.user)
        self.assertEqual(session["user"]["display_name"], "Marcos Eduardo")
        profile = self.client.get(reverse("auth-profile"))
        self.assertEqual(profile.data["display_name"], "Marcos Eduardo")
        self.assertEqual(profile.data["username"], self.user.username)
        saved = self.client.patch(
            reverse("auth-profile"),
            {"bio": "Olá", "display_name": "Outro", "username": "outro"},
        )
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(saved.data["display_name"], "Marcos Eduardo")
        self.user.refresh_from_db()
        self.assertTrue(self.user.username.startswith("google_"))
        self.assertFalse(self.user.has_usable_password())

    def test_posts_and_comments_have_public_name_and_keep_author_identifier(self):
        post = Post.objects.create(
            user=self.user, title="Participação", category="Cidadania", content="Olá"
        )
        comment = PostComment.objects.create(user=self.user, post=post, content="Obrigado")
        for data in (
            PostSerializer(post, context={"request": SimpleNamespace(user=self.user)}).data,
            PostCommentSerializer(comment).data,
        ):
            self.assertEqual(data["author"], self.user.username)
            self.assertEqual(data["author_display_name"], "Marcos Eduardo")

    def test_accounts_without_name_keep_username_as_fallback(self):
        self.user.first_name = ""
        self.user.username = "aluno"
        self.user.save()
        response = self.client.get(reverse("auth-profile"))
        self.assertEqual(response.data["display_name"], "aluno")
from types import SimpleNamespace

