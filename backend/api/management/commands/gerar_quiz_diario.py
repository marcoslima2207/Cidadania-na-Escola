from datetime import date

from django.core.management.base import BaseCommand

from api.quiz_daily import get_daily_quiz


class Command(BaseCommand):
    help = (
        "Gera e salva o desafio diário. Pode ser executado pelo agendador antes do primeiro acesso."
    )

    def add_arguments(self, parser):
        parser.add_argument("--data", type=date.fromisoformat, default=None)

    def handle(self, *args, **options):
        quiz = get_daily_quiz(options["data"])
        self.stdout.write(
            self.style.SUCCESS(f"{quiz.data}: {len(quiz.perguntas)} perguntas ({quiz.origem}).")
        )
