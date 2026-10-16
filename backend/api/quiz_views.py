from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Nivel, ProgressoUsuario, Tema, TentativaQuiz
from .quiz_daily import QUESTION_FIELDS, get_daily_quiz
from .quiz_serializers import NivelSerializer, RespostaSerializer, TemaSerializer

MAX_VIDAS = 5


def locked_progress(user):
    # A trava no usuário também serializa a primeira criação do progresso.
    get_user_model().objects.select_for_update().get(pk=user.pk)
    progress, _ = ProgressoUsuario.objects.get_or_create(user=user)
    today = timezone.localdate()
    if progress.data_vidas < today:
        progress.vidas = MAX_VIDAS
        progress.data_vidas = today
        progress.save(update_fields=["vidas", "data_vidas"])
    return progress


def progress_data(progress):
    completed = list(progress.niveis_concluidos.values_list("id", flat=True))
    next_level = Nivel.objects.exclude(pk__in=completed).first()
    return {
        "vidas": progress.vidas,
        "max_vidas": MAX_VIDAS,
        "data_vidas": progress.data_vidas,
        "xp": progress.xp,
        "niveis_concluidos": completed,
        "proximo_nivel": next_level.pk if next_level else None,
    }


def public_questions(questions):
    return [
        {
            key: value
            for key, value in question.items()
            if key not in ("alternativa_correta", "explicacao")
        }
        for question in questions
    ]


def attempt_data(attempt):
    return {
        "id": attempt.pk,
        "nivel": attempt.nivel_id,
        "diario": attempt.diario_id,
        "perguntas": public_questions(attempt.perguntas),
        "respondidas": len(attempt.respostas),
        "acertos": sum(answer["correta"] for answer in attempt.respostas.values()),
        "concluida": attempt.concluida,
        "aprovado": attempt.aprovado,
        "xp_ganho": attempt.xp_ganho,
    }


def start_attempt(user, *, level=None, daily=None):
    with transaction.atomic():
        progress = locked_progress(user)
        if progress.vidas == 0:
            raise PermissionDenied("Seus corações acabaram. Volte amanhã para continuar.")
        if daily and daily.data != timezone.localdate():
            raise ValidationError("Um novo dia começou. Atualize o desafio diário.")
        if (
            level
            and Nivel.objects.filter(ordem__lt=level.ordem)
            .exclude(pk__in=progress.niveis_concluidos.values("pk"))
            .exists()
        ):
            raise PermissionDenied("Conclua os níveis anteriores para liberar esta lição.")
        attempt = TentativaQuiz.objects.filter(
            user=user,
            nivel=level,
            diario=daily,
            concluida=False,
            criado_em__date=timezone.localdate(),
        ).first()
        if not attempt:
            questions = (
                daily.perguntas
                if daily
                else list(level.perguntas.order_by("id").values("id", *QUESTION_FIELDS))
            )
            if not questions:
                raise ValidationError("Este nível ainda não tem perguntas.")
            attempt = TentativaQuiz.objects.create(
                user=user, nivel=level, diario=daily, perguntas=questions
            )
        return Response({"tentativa": attempt_data(attempt), "progresso": progress_data(progress)})


class TemaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tema.objects.order_by("id")
    serializer_class = TemaSerializer


class NivelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Nivel.objects.select_related("tema").annotate(total_perguntas=Count("perguntas"))
    serializer_class = NivelSerializer

    @action(detail=True, methods=["get"])
    def perguntas(self, request, pk=None):
        level = self.get_object()
        return Response(
            public_questions(list(level.perguntas.order_by("id").values("id", *QUESTION_FIELDS)))
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def iniciar(self, request, pk=None):
        return start_attempt(request.user, level=self.get_object())


class QuizViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def progresso(self, request):
        with transaction.atomic():
            return Response(progress_data(locked_progress(request.user)))

    @action(detail=False, methods=["get", "post"])
    def diario(self, request):
        if request.method == "POST" and not request.user.is_authenticated:
            raise PermissionDenied("Entre na sua conta para iniciar o desafio.")
        daily = get_daily_quiz()
        if request.method == "POST":
            return start_attempt(request.user, daily=daily)
        return Response(
            {"data": daily.data, "origem": daily.origem, "total_perguntas": len(daily.perguntas)}
        )


class TentativaViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TentativaQuiz.objects.filter(user=self.request.user).select_related(
            "nivel", "diario"
        )

    @action(detail=True, methods=["post"])
    def responder(self, request, pk=None):
        serializer = RespostaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        with transaction.atomic():
            progress = locked_progress(request.user)
            attempt = self.get_object()
            question_id = str(payload["pergunta_id"])
            previous = attempt.respostas.get(question_id)
            if previous:
                if previous["alternativa"] != payload["alternativa"]:
                    raise ValidationError("Esta pergunta já foi respondida.")
                return Response(
                    {
                        **previous,
                        "tentativa": attempt_data(attempt),
                        "progresso": progress_data(progress),
                    }
                )
            if (
                attempt.concluida
                or attempt.criado_em.astimezone(timezone.get_current_timezone()).date()
                != timezone.localdate()
            ):
                raise ValidationError("Esta tentativa terminou. Inicie uma nova lição.")
            if progress.vidas == 0:
                raise PermissionDenied("Seus corações acabaram. Volte amanhã.")
            question = attempt.perguntas[len(attempt.respostas)]
            if question["id"] != payload["pergunta_id"]:
                raise ValidationError("Responda às perguntas na ordem da lição.")
            correct = question["alternativa_correta"] == payload["alternativa"]
            feedback = {
                "alternativa": payload["alternativa"],
                "correta": correct,
                "alternativa_correta": question["alternativa_correta"],
                "explicacao": question["explicacao"],
            }
            attempt.respostas[question_id] = feedback
            if not correct:
                progress.vidas -= 1
            attempt.concluida = (
                len(attempt.respostas) == len(attempt.perguntas) or progress.vidas == 0
            )
            if attempt.concluida:
                score = sum(a["correta"] for a in attempt.respostas.values())
                attempt.aprovado = progress.vidas > 0 and score / len(attempt.perguntas) >= 0.7
                if attempt.aprovado:
                    if attempt.nivel_id:
                        first_pass = not progress.niveis_concluidos.filter(
                            pk=attempt.nivel_id
                        ).exists()
                        progress.niveis_concluidos.add(attempt.nivel_id)
                    else:
                        first_pass = not TentativaQuiz.objects.filter(
                            user=request.user, diario=attempt.diario, aprovado=True
                        ).exists()
                    if first_pass:
                        attempt.xp_ganho = score * 10
                        progress.xp += attempt.xp_ganho
            progress.save(update_fields=["vidas", "xp"])
            attempt.save(update_fields=["respostas", "concluida", "aprovado", "xp_ganho"])
            return Response(
                {
                    **feedback,
                    "tentativa": attempt_data(attempt),
                    "progresso": progress_data(progress),
                }
            )
