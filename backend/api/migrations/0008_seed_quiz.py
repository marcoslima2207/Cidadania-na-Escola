from django.db import migrations

from ._quiz_seed_data import TOPICS


def seed_quiz(apps, schema_editor):
    Tema = apps.get_model("api", "Tema")
    Nivel = apps.get_model("api", "Nivel")
    Pergunta = apps.get_model("api", "Pergunta")
    database = schema_editor.connection.alias
    for index, (slug, name, icon, description, questions) in enumerate(TOPICS):
        topic = Tema.objects.using(database).create(
            slug=slug, nome=name, icone=icon, descricao=description
        )
        for part in range(2):
            level = Nivel.objects.using(database).create(
                tema=topic,
                titulo=f"{name}: {'primeiros passos' if part == 0 else 'na prática'}",
                ordem=index * 2 + part + 1,
            )
            for statement, a, b, c, correct, explanation in questions[part * 3 : part * 3 + 3]:
                Pergunta.objects.using(database).create(
                    nivel=level,
                    categoria=slug,
                    enunciado=statement,
                    opcao_a=a,
                    opcao_b=b,
                    opcao_c=c,
                    alternativa_correta=correct,
                    explicacao=explanation,
                )


class Migration(migrations.Migration):
    dependencies = [("api", "0007_nivel_quizdiario_tema_pergunta_explicacao_and_more")]
    operations = [migrations.RunPython(seed_quiz, migrations.RunPython.noop)]
