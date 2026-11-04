import json
import logging
import random
from datetime import timedelta
from urllib.error import URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import APIException, ValidationError

from .models import Pergunta, QuizDiario
from .quiz_serializers import PerguntaGeradaSerializer

logger = logging.getLogger(__name__)
DAILY_QUESTION_COUNT = 5
QUESTION_FIELDS = (
    "enunciado",
    "opcao_a",
    "opcao_b",
    "opcao_c",
    "alternativa_correta",
    "categoria",
    "explicacao",
)


class QuizIndisponivel(APIException):
    status_code = 503
    default_detail = (
        "O desafio diário está sendo preparado. Tente novamente em alguns instantes."
    )


def generate_questions(day):
    yesterday = QuizDiario.objects.filter(data=day - timedelta(days=1)).first()
    previous = (
        {q["enunciado"].strip().casefold() for q in yesterday.perguntas}
        if yesterday
        else set()
    )
    if settings.GEMINI_API_KEY:
        try:
            fields = {field: {"type": "string"} for field in QUESTION_FIELDS}
            fields["alternativa_correta"]["enum"] = list("abc")
            fields["categoria"]["enum"] = ["cidadania"]
            prompt = (
                f"Crie {DAILY_QUESTION_COUNT} perguntas inéditas para {day}, em português brasileiro acessível a alunos da EJA. "
                "Use a categoria cidadania e aborde direitos, deveres e participação na comunidade. "
                "Três alternativas, exatamente uma correta, com explicação educativa. "
                "Varie a posição da alternativa correta. Use conceitos estáveis, sem notícias recentes, "
                "sem aconselhamento jurídico, conteúdo partidário ou estereótipos. "
                f"Não repita estes enunciados do dia anterior: {json.dumps(sorted(previous), ensure_ascii=False)}"
            )
            payload = {
                "model": settings.GEMINI_MODEL,
                "input": prompt,
                "store": False,
                "response_format": {
                    "type": "text",
                    "mime_type": "application/json",
                    "schema": {
                        "type": "array",
                        "minItems": DAILY_QUESTION_COUNT,
                        "maxItems": DAILY_QUESTION_COUNT,
                        "items": {
                            "type": "object",
                            "properties": fields,
                            "required": list(QUESTION_FIELDS),
                        },
                    },
                },
            }
            request = Request(
                "https://generativelanguage.googleapis.com/v1beta/interactions",
                data=json.dumps(payload).encode(),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": settings.GEMINI_API_KEY,
                },
                method="POST",
            )
            with urlopen(request, timeout=25) as response:
                result = json.load(response)
            if not isinstance(result, dict) or result.get("status") != "completed":
                raise ValueError("A geração não foi concluída.")
            output = "".join(
                part.get("text", "")
                for step in result.get("steps", [])
                if isinstance(step, dict) and step.get("type") == "model_output"
                for part in step.get("content", [])
                if isinstance(part, dict) and part.get("type") == "text"
            )
            questions = json.loads(output)
            serializer = PerguntaGeradaSerializer(data=questions, many=True)
            serializer.is_valid(raise_exception=True)
            questions = serializer.validated_data
            enunciados = {q["enunciado"].strip().casefold() for q in questions}
            if (
                len(questions) != DAILY_QUESTION_COUNT
                or len(enunciados) != DAILY_QUESTION_COUNT
                or enunciados & previous
            ):
                raise ValueError("Perguntas repetidas ou quantidade inválida.")
            if any(q["categoria"] != "cidadania" for q in questions):
                raise ValueError("Distribuição de temas inválida.")
            return questions, "ia"
        except (
            URLError,
            TimeoutError,
            OSError,
            ValueError,
            KeyError,
            TypeError,
            ValidationError,
        ):
            # Não registra a resposta do provedor ou credenciais nos logs.
            logger.warning(
                "Geração do quiz diário indisponível ou inválida; usando o banco educativo."
            )

    pool = [
        q
        for q in Pergunta.objects.filter(nivel__isnull=False, categoria="cidadania")
        .order_by("id")
        .values(*QUESTION_FIELDS)
        if q["enunciado"].strip().casefold() not in previous
    ]
    if len(pool) < DAILY_QUESTION_COUNT:
        raise QuizIndisponivel()
    return random.Random(day.isoformat()).sample(pool, DAILY_QUESTION_COUNT), "reserva"


def get_daily_quiz(day=None):
    day = day or timezone.localdate()
    quiz, _ = QuizDiario.objects.get_or_create(data=day, defaults={"origem": "reserva"})
    if quiz.perguntas:
        return quiz
    now = timezone.now()
    # Uma concessão no banco coordena todos os workers, sem segurar uma transação durante a chamada de IA.
    claimed = (
        QuizDiario.objects.filter(pk=quiz.pk, perguntas=[])
        .filter(
            Q(geracao_iniciada_em__isnull=True)
            | Q(geracao_iniciada_em__lt=now - timedelta(seconds=60)),
        )
        .update(geracao_iniciada_em=now)
    )
    if not claimed:
        raise QuizIndisponivel()
    try:
        questions, source = generate_questions(day)
        quiz.perguntas = [dict(q, id=index) for index, q in enumerate(questions, 1)]
        quiz.origem = source
        quiz.save(update_fields=["perguntas", "origem"])
        return quiz
    finally:
        QuizDiario.objects.filter(pk=quiz.pk, geracao_iniciada_em=now).update(
            geracao_iniciada_em=None
        )
