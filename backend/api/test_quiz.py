import json
from datetime import timedelta
from io import BytesIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import (
    GoogleIdentity,
    Nivel,
    Pergunta,
    ProgressoUsuario,
    QuizDiario,
    TentativaQuiz,
)
from .quiz_daily import get_daily_quiz

User = get_user_model()


@override_settings(GEMINI_API_KEY="")
class QuizTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="quiz-aluno", password="12345678")
        self.client.force_authenticate(self.user)
        self.level = Nivel.objects.first()
        self.next_level = Nivel.objects.get(ordem=self.level.ordem + 1)

    def start(self, level=None):
        return self.client.post(reverse("quiz-nivel-iniciar", args=[(level or self.level).pk]))

    def answer(self, attempt, question, answer=None):
        return self.client.post(
            reverse("quiz-tentativa-responder", args=[attempt["id"]]),
            {
                "pergunta_id": question["id"],
                "alternativa": answer or question["alternativa_correta"],
            },
            format="json",
        )

    def complete(self):
        attempt = self.start().data["tentativa"]
        questions = TentativaQuiz.objects.get(pk=attempt["id"]).perguntas
        for question in questions:
            response = self.answer(attempt, question)
            self.assertEqual(response.status_code, 200)
        return response

    def test_seed_and_public_contract(self):
        self.assertEqual(Nivel.objects.count(), 12)
        self.assertEqual(Pergunta.objects.filter(nivel__isnull=False).count(), 36)
        response = self.client.get(reverse("quiz-nivel-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["total_perguntas"], 3)
        response = self.client.get(reverse("quiz-nivel-perguntas", args=[self.level.pk]))
        self.assertNotIn("alternativa_correta", response.data[0])
        self.assertNotIn("explicacao", response.data[0])
        legacy = self.client.get(reverse("pergunta-list"))
        self.assertFalse(
            any(q["id"] in self.level.perguntas.values_list("id", flat=True) for q in legacy.data)
        )

    def test_progress_requires_authentication(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(reverse("quiz-progresso")).status_code, 401)
        self.assertEqual(self.start().status_code, 401)

    def test_initial_progress_and_next_day_reset(self):
        response = self.client.get(reverse("quiz-progresso"))
        self.assertEqual(response.data["vidas"], 5)
        self.assertEqual(response.data["proximo_nivel"], self.level.pk)
        progress = ProgressoUsuario.objects.get(user=self.user)
        progress.vidas = 0
        progress.xp = 40
        progress.data_vidas = timezone.localdate() - timedelta(days=1)
        progress.niveis_concluidos.add(self.level)
        progress.save()
        response = self.client.get(reverse("quiz-progresso"))
        self.assertEqual(response.data["vidas"], 5)
        self.assertEqual(response.data["xp"], 40)
        self.assertEqual(response.data["proximo_nivel"], self.next_level.pk)

    def test_cannot_skip_level_or_submit_out_of_order(self):
        self.assertEqual(self.start(self.next_level).status_code, 403)
        attempt = self.start().data["tentativa"]
        questions = TentativaQuiz.objects.get(pk=attempt["id"]).perguntas
        self.assertEqual(self.answer(attempt, questions[1]).status_code, 400)
        self.assertEqual(self.client.get(reverse("quiz-progresso")).data["vidas"], 5)

    def test_resume_and_wrong_answer_are_idempotent(self):
        attempt = self.start().data["tentativa"]
        self.assertEqual(self.start().data["tentativa"]["id"], attempt["id"])
        question = TentativaQuiz.objects.get(pk=attempt["id"]).perguntas[0]
        wrong = next(letter for letter in "abc" if letter != question["alternativa_correta"])
        for _ in range(2):
            response = self.answer(attempt, question, wrong)
            self.assertFalse(response.data["correta"])
            self.assertEqual(response.data["progresso"]["vidas"], 4)
        self.assertEqual(self.answer(attempt, question).status_code, 400)
        resumed = self.start().data["tentativa"]
        self.assertEqual(resumed["respondidas"], 1)

    def test_completion_unlocks_next_and_awards_xp_only_once(self):
        response = self.complete()
        self.assertTrue(response.data["tentativa"]["aprovado"])
        self.assertEqual(response.data["tentativa"]["xp_ganho"], 30)
        self.assertEqual(response.data["progresso"]["xp"], 30)
        self.assertEqual(response.data["progresso"]["proximo_nivel"], self.next_level.pk)
        self.assertEqual(self.start(self.next_level).status_code, 200)
        response = self.complete()
        self.assertEqual(response.data["tentativa"]["xp_ganho"], 0)
        self.assertEqual(response.data["progresso"]["xp"], 30)

    def test_failed_lesson_does_not_unlock_level(self):
        attempt = self.start().data["tentativa"]
        for index, question in enumerate(TentativaQuiz.objects.get(pk=attempt["id"]).perguntas):
            answer = (
                next(letter for letter in "abc" if letter != question["alternativa_correta"])
                if index == 0
                else None
            )
            response = self.answer(attempt, question, answer)
        self.assertTrue(response.data["tentativa"]["concluida"])
        self.assertFalse(response.data["tentativa"]["aprovado"])
        self.assertEqual(response.data["progresso"]["xp"], 0)
        self.assertEqual(self.start(self.next_level).status_code, 403)

    def test_zero_hearts_ends_attempt_and_blocks_start(self):
        attempt = self.start().data["tentativa"]
        ProgressoUsuario.objects.filter(user=self.user).update(vidas=1)
        question = TentativaQuiz.objects.get(pk=attempt["id"]).perguntas[0]
        wrong = next(letter for letter in "abc" if letter != question["alternativa_correta"])
        response = self.answer(attempt, question, wrong)
        self.assertEqual(response.data["progresso"]["vidas"], 0)
        self.assertTrue(response.data["tentativa"]["concluida"])
        self.assertFalse(response.data["tentativa"]["aprovado"])
        self.assertEqual(self.start().status_code, 403)

    def test_another_user_cannot_answer_my_attempt(self):
        attempt = self.start().data["tentativa"]
        question = TentativaQuiz.objects.get(pk=attempt["id"]).perguntas[0]
        other = User.objects.create_user(username="quiz-outro")
        self.client.force_authenticate(other)
        self.assertEqual(self.answer(attempt, question).status_code, 404)

    def test_attempt_expires_at_local_midnight(self):
        attempt = self.start().data["tentativa"]
        TentativaQuiz.objects.filter(pk=attempt["id"]).update(
            criado_em=timezone.now() - timedelta(days=1)
        )
        question = TentativaQuiz.objects.get(pk=attempt["id"]).perguntas[0]
        self.assertEqual(self.answer(attempt, question).status_code, 400)
        self.assertNotEqual(self.start().data["tentativa"]["id"], attempt["id"])

    def test_invalid_answer_is_rejected(self):
        attempt = self.start().data["tentativa"]
        response = self.client.post(
            reverse("quiz-tentativa-responder", args=[attempt["id"]]),
            {"pergunta_id": 1, "alternativa": "d"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)


@override_settings(GEMINI_API_KEY="")
class DailyQuizTests(APITestCase):
    def test_daily_is_persisted_and_does_not_repeat_yesterday(self):
        today = timezone.localdate()
        yesterday = get_daily_quiz(today - timedelta(days=1))
        current = get_daily_quiz(today)
        previous_text = {q["enunciado"] for q in yesterday.perguntas}
        self.assertEqual(current.origem, "reserva")
        self.assertEqual(len(current.perguntas), 12)
        self.assertFalse(previous_text & {q["enunciado"] for q in current.perguntas})
        self.assertEqual(current.pk, get_daily_quiz(today).pk)

    def test_metadata_is_public_without_answers_and_start_requires_auth(self):
        response = self.client.get(reverse("quiz-diario"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_perguntas"], 12)
        self.assertNotIn("perguntas", response.data)
        self.assertEqual(self.client.post(reverse("quiz-diario")).status_code, 403)

    def test_daily_can_be_completed_and_xp_is_not_farmed(self):
        user = User.objects.create_user(username="diario")
        self.client.force_authenticate(user)
        for expected in [120, 0]:
            start = self.client.post(reverse("quiz-diario")).data["tentativa"]
            questions = TentativaQuiz.objects.get(pk=start["id"]).perguntas
            for question in questions:
                response = self.client.post(
                    reverse("quiz-tentativa-responder", args=[start["id"]]),
                    {
                        "pergunta_id": question["id"],
                        "alternativa": question["alternativa_correta"],
                    },
                    format="json",
                )
            self.assertEqual(response.data["tentativa"]["xp_ganho"], expected)
        self.assertEqual(ProgressoUsuario.objects.get(user=user).xp, 120)
        self.assertFalse(ProgressoUsuario.objects.get(user=user).niveis_concluidos.exists())

    @override_settings(GEMINI_API_KEY="fake-key")
    @patch("api.quiz_daily.urlopen")
    def test_valid_ai_output_is_validated_and_saved(self, urlopen):
        # Duas perguntas por tema, sem acessar o provedor externo.
        questions = []
        for category in [
            "cidadania",
            "democracia",
            "desinformacao",
            "checagem",
            "trabalhista",
            "educacao",
        ]:
            questions.extend(
                list(
                    Pergunta.objects.filter(nivel__isnull=False, categoria=category).values(
                        "enunciado",
                        "opcao_a",
                        "opcao_b",
                        "opcao_c",
                        "alternativa_correta",
                        "categoria",
                        "explicacao",
                    )
                )[:2]
            )
        urlopen.return_value.__enter__.return_value = BytesIO(
            json.dumps(
                {
                    "status": "completed",
                    "steps": [
                        {
                            "type": "model_output",
                            "content": [{"type": "text", "text": json.dumps(questions)}],
                        }
                    ],
                }
            ).encode()
        )
        quiz = get_daily_quiz()
        self.assertEqual(quiz.origem, "ia")
        self.assertEqual(len(quiz.perguntas), 12)
        self.assertEqual(get_daily_quiz().pk, quiz.pk)
        self.assertEqual(urlopen.call_count, 1)
        request = urlopen.call_args.args[0]
        self.assertNotIn("fake-key", request.full_url)

    @override_settings(GEMINI_API_KEY="fake-key")
    @patch("api.quiz_daily.urlopen")
    def test_provider_failure_uses_explicit_fallback(self, urlopen):
        urlopen.side_effect = TimeoutError()
        quiz = get_daily_quiz()
        self.assertEqual(quiz.origem, "reserva")
        self.assertEqual(len(quiz.perguntas), 12)

    @override_settings(GEMINI_API_KEY="fake-key")
    @patch("api.quiz_daily.urlopen")
    def test_invalid_ai_output_uses_fallback(self, urlopen):
        urlopen.return_value.__enter__.return_value = BytesIO(
            b'{"status":"completed","steps":[{"type":"model_output","content":[{"type":"text","text":"[{}]"}]}]}'
        )
        self.assertEqual(get_daily_quiz().origem, "reserva")

    @override_settings(GEMINI_API_KEY="fake-key")
    @patch("api.quiz_daily.urlopen")
    def test_malformed_provider_response_uses_fallback(self, urlopen):
        urlopen.return_value.__enter__.return_value = BytesIO(b"[]")
        self.assertEqual(get_daily_quiz().origem, "reserva")

    def test_generation_in_progress_returns_retryable_error(self):
        QuizDiario.objects.create(
            data=timezone.localdate(), origem="reserva", geracao_iniciada_em=timezone.now()
        )
        response = self.client.get(reverse("quiz-diario"))
        self.assertEqual(response.status_code, 503)

    def test_expired_generation_lease_can_be_retried(self):
        QuizDiario.objects.create(
            data=timezone.localdate(),
            origem="reserva",
            geracao_iniciada_em=timezone.now() - timedelta(seconds=61),
        )
        self.assertEqual(len(get_daily_quiz().perguntas), 12)


@override_settings(GOOGLE_CLIENT_ID="test-client")
class GoogleLoginTests(APITestCase):
    def setUp(self):
        self.nonce = self.client.get(reverse("auth-google-config")).data["nonce"]

    def claims(self, **overrides):
        return {
            "sub": "google-subject",
            "email": "pessoa@gmail.com",
            "email_verified": True,
            "name": "Pessoa",
            "nonce": self.nonce,
            **overrides,
        }

    def login(self):
        return self.client.post(reverse("auth-google"), {"credential": "id-token"}, format="json")

    @patch("api.google_auth.id_token.verify_oauth2_token")
    def test_valid_google_login_creates_profile_and_session(self, verify):
        verify.return_value = self.claims()
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["display_name"], "Pessoa")
        user = User.objects.get(email="pessoa@gmail.com")
        self.assertFalse(user.has_usable_password())
        self.assertTrue(GoogleIdentity.objects.filter(user=user, subject="google-subject").exists())
        self.assertTrue(hasattr(user, "profile"))
        self.assertEqual(verify.call_args.args[2], "test-client")
        self.assertEqual(self.login().status_code, 400)  # Nonce só pode ser usado uma vez.

    @patch("api.google_auth.id_token.verify_oauth2_token")
    def test_same_subject_reuses_user(self, verify):
        verify.return_value = self.claims()
        first = self.login()
        self.nonce = self.client.get(reverse("auth-google-config")).data["nonce"]
        verify.return_value = self.claims()
        second = self.login()
        self.assertEqual(second.data["user"]["id"], first.data["user"]["id"])
        self.assertEqual(User.objects.count(), 1)

    @patch("api.google_auth.id_token.verify_oauth2_token")
    def test_google_authoritative_email_can_link_existing_account(self, verify):
        user = User.objects.create_user(
            username="existing", email="pessoa@gmail.com", password="12345678"
        )
        verify.return_value = self.claims()
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["id"], user.pk)
        user.refresh_from_db()
        self.assertTrue(user.check_password("12345678"))

    @patch("api.google_auth.id_token.verify_oauth2_token")
    def test_third_party_email_cannot_take_over_existing_account(self, verify):
        User.objects.create_user(
            username="existing", email="pessoa@example.com", password="12345678"
        )
        verify.return_value = self.claims(email="pessoa@example.com")
        self.assertEqual(self.login().status_code, 400)
        self.assertFalse(GoogleIdentity.objects.exists())

    @patch("api.google_auth.id_token.verify_oauth2_token")
    def test_invalid_unverified_and_missing_nonce_are_rejected(self, verify):
        verify.side_effect = ValueError("invalid signature")
        self.assertEqual(self.login().status_code, 400)
        verify.side_effect = None
        verify.return_value = self.claims(nonce="different")
        self.assertEqual(self.login().status_code, 400)
        verify.return_value = self.claims(email_verified=False)
        self.assertEqual(self.login().status_code, 400)
        self.assertFalse(User.objects.exists())

    @override_settings(GOOGLE_CLIENT_ID="")
    def test_unconfigured_login_is_explicit(self):
        self.assertEqual(self.client.get(reverse("auth-google-config")).data["client_id"], "")
        self.assertEqual(self.login().status_code, 503)

    @patch("api.google_auth.id_token.verify_oauth2_token")
    def test_inactive_user_is_rejected_without_linking_identity(self, verify):
        User.objects.create_user(username="inactive", email="pessoa@gmail.com", is_active=False)
        verify.return_value = self.claims()
        self.assertEqual(self.login().status_code, 400)
        self.assertFalse(GoogleIdentity.objects.exists())
