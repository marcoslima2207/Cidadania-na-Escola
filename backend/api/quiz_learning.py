from collections import Counter, deque
from datetime import date, datetime, time, timedelta
from hashlib import sha256

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

from .models import Nivel, TentativaQuiz
from .serializers import ProfileSerializer
from .user_display import user_display_name

DISINFORMATION = ("desinformacao", "checagem")


def trail_slugs(slug):
    return DISINFORMATION if slug in DISINFORMATION else (slug,)


def local_midnight(day):
    return timezone.make_aware(datetime.combine(day, time.min))


def week_start():
    today = timezone.localdate()
    return today - timedelta(days=today.weekday())


def weekly_rewards(start):
    return TentativaQuiz.objects.filter(
        modo=TentativaQuiz.OFICIAL,
        xp_ganho__gt=0,
        atualizado_em__gte=local_midnight(start),
        atualizado_em__lt=local_midnight(start + timedelta(days=7)),
    )


def question_key(question):
    normalized = " ".join(question["enunciado"].casefold().split())
    return sha256(normalized.encode()).hexdigest()


def answered_questions(attempt):
    for question in attempt.perguntas:
        answer = attempt.respostas.get(str(question["id"]))
        if answer:
            yield question, answer


def answer_day(attempt, answer):
    if answer.get("data"):
        return date.fromisoformat(answer["data"])
    return timezone.localdate(attempt.criado_em)


def review_history(user):
    errors = {}
    reviewed = set()
    attempts = (
        TentativaQuiz.objects.filter(user=user)
        .exclude(respostas={})
        .exclude(modo=TentativaQuiz.TREINO)
        .order_by("atualizado_em", "id")
    )
    for attempt in attempts.iterator():
        for question, answer in answered_questions(attempt):
            key = question_key(question)
            if attempt.modo == TentativaQuiz.REVISAO:
                if answer["correta"]:
                    reviewed.add(key)
            elif not answer["correta"]:
                errors.pop(key, None)
                errors[key] = (question, answer)
    return errors, reviewed


def dashboard_data(user, progress):
    attempts = (
        TentativaQuiz.objects.filter(user=user)
        .exclude(respostas={})
        .select_related("nivel")
        .order_by("atualizado_em", "id")
    )
    completion_dates = {}
    studied_days = set()
    difficult = Counter()
    reviewed = set()
    correct = total = 0
    history = deque(maxlen=30)
    today = timezone.localdate()
    daily_pass = False
    for attempt in attempts.iterator():
        day = timezone.localdate(attempt.atualizado_em)
        answers = list(answered_questions(attempt))
        studied_days.update(answer_day(attempt, answer) for _, answer in answers)
        score = sum(answer["correta"] for _, answer in answers)
        if attempt.modo == TentativaQuiz.OFICIAL:
            correct += score
            total += len(answers)
            for question, answer in answers:
                if not answer["correta"]:
                    difficult[question["categoria"]] += 1
            if attempt.aprovado and attempt.nivel_id:
                completion_dates.setdefault(attempt.nivel_id, day)
            if attempt.aprovado and attempt.diario_id and day == today:
                daily_pass = True
        elif attempt.modo == TentativaQuiz.REVISAO:
            reviewed.update(
                question_key(question)
                for question, answer in answers
                if answer["correta"]
            )
        title = (
            "Treino livre"
            if attempt.modo == TentativaQuiz.TREINO
            else "Revisão de erros"
            if attempt.modo == TentativaQuiz.REVISAO
            else attempt.nivel.titulo
            if attempt.nivel_id
            else "Desafio diário"
        )
        history.append(
            {
                "id": attempt.pk,
                "titulo": title,
                "data": day,
                "xp": attempt.xp_ganho,
                "acertos": score,
                "respondidas": len(answers),
            }
        )

    completed = set(progress.niveis_concluidos.values_list("id", flat=True))
    days = sorted(studied_days)
    cursor = today if today in studied_days else today - timedelta(days=1)
    streak = 0
    while cursor in studied_days:
        streak += 1
        cursor -= timedelta(days=1)

    def mission(title, description, value, goal):
        return {
            "titulo": title,
            "descricao": description,
            "atual": min(value, goal),
            "objetivo": goal,
        }

    def award(title, description, day):
        return {"titulo": title, "descricao": description, "data": day}

    def trail_date(slug):
        levels = set(
            Nivel.objects.filter(tema__slug__in=trail_slugs(slug)).values_list(
                "id", flat=True
            )
        )
        if levels and levels <= completed and levels <= completion_dates.keys():
            return max(completion_dates[level] for level in levels)
        return None

    return {
        "respondidas": total,
        "acertos": correct,
        "sequencia": streak,
        "xp_semanal": weekly_rewards(week_start())
        .filter(user=user)
        .aggregate(total=Sum("xp_ganho"))["total"]
        or 0,
        "dificuldades": [
            {"categoria": slug, "erros": count}
            for slug, count in difficult.most_common()
        ],
        "historico": list(reversed(history)),
        "missoes": [
            mission(
                "Primeira lição", "Conclua uma lição da trilha.", len(completed), 1
            ),
            mission(
                "Cinco acertos",
                "Acerte cinco perguntas em lições ou desafios.",
                correct,
                5,
            ),
            mission(
                "Aprender com os erros",
                "Acerte três questões em revisões.",
                len(reviewed),
                3,
            ),
            mission(
                "Desafio de hoje",
                "Seja aprovado no desafio diário.",
                int(daily_pass),
                1,
            ),
            mission(
                "Rotina de estudos", "Estude em três dias diferentes.", len(days), 3
            ),
        ],
        "conquistas": [
            award(
                "Primeiros Passos",
                "Conclua sua primeira lição.",
                min(completion_dates.values(), default=None),
            ),
            award(
                "Cidadão Participativo",
                "Conclua a trilha de Cidadania.",
                trail_date("cidadania"),
            ),
            award(
                "Investigador da Verdade",
                "Conclua a trilha de Desinformação e Checagem.",
                trail_date("desinformacao"),
            ),
            award(
                "Defensor dos Direitos",
                "Conclua a trilha de Direitos Trabalhistas.",
                trail_date("trabalhista"),
            ),
            award(
                "Estudante Dedicado",
                "Estude em três dias diferentes.",
                days[2] if len(days) >= 3 else None,
            ),
        ],
    }


def ranking_data(request, participating):
    start = week_start()
    scores = list(
        weekly_rewards(start)
        .filter(user__progresso_quiz__participa_ranking=True, user__is_active=True)
        .values("user_id")
        .annotate(xp=Sum("xp_ganho"))
        .order_by("-xp", "user_id")
    )
    my_position = next(
        (
            index
            for index, score in enumerate(scores, 1)
            if score["user_id"] == request.user.pk
        ),
        None,
    )
    leaders = scores[:20]
    users = (
        get_user_model()
        .objects.select_related("profile")
        .defer("profile__avatar_image")
        .in_bulk([score["user_id"] for score in leaders])
    )
    rows = []
    for index, score in enumerate(leaders, 1):
        user = users.get(score["user_id"])
        if not user:
            continue
        profile = getattr(user, "profile", None)
        name = user_display_name(user)
        rows.append(
            {
                "posicao": index,
                "nome": "Estudante" if "@" in name else name,
                "avatar_url": (
                    ProfileSerializer(context={"request": request}).get_avatar_file_url(
                        profile
                    )
                    or profile.avatar_url
                )
                if profile
                else "",
                "avatar_choice": profile.avatar_choice if profile else "",
                "xp": score["xp"],
                "eu": user.pk == request.user.pk,
            }
        )
    return {
        "inicio": start,
        "participante": participating,
        "minha_posicao": my_position,
        "resultados": rows,
    }
