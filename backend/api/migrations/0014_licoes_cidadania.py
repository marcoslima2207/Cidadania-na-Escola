from django.db import migrations
from django.db.models import Max

EXTRA_LESSONS = [
    (
        "Controle social e fiscalização",
        "Aprenda a acompanhar decisões e gastos públicos usando canais oficiais.",
        [
            (
                "O que é controle social das políticas públicas?",
                "Acompanhar e fiscalizar ações do poder público",
                "Proibir críticas à prefeitura",
                "Deixar todas as decisões para empresas",
                "a",
                "Controle social é a participação da população no acompanhamento e na fiscalização das ações públicas.",
            ),
            (
                "Onde buscar informações oficiais sobre despesas da prefeitura?",
                "Em uma corrente anônima",
                "No Portal da Transparência ou no serviço de informação ao cidadão",
                "Somente em grupos privados",
                "b",
                "Portais da Transparência publicam dados de despesas. O serviço de informação recebe pedidos quando os dados não estão disponíveis.",
            ),
            (
                "Você viu que uma obra pública parou. Qual é um bom primeiro passo?",
                "Afirmar sem provas que houve fraude",
                "Remover a placa da obra",
                "Consultar a placa e os dados oficiais para pedir esclarecimentos",
                "c",
                "Consultar dados e pedir esclarecimentos ajuda a fiscalizar a obra com base em fatos.",
            ),
        ],
    ),
    (
        "Projetos e ações coletivas",
        "Transforme uma necessidade da comunidade em um plano de ação.",
        [
            (
                "Como começar um projeto para melhorar a escola?",
                "Escolher a solução sem consultar ninguém",
                "Ouvir a comunidade escolar e identificar um problema comum",
                "Comprar materiais antes de planejar",
                "b",
                "Ouvir as pessoas ajuda a entender o problema e a planejar uma solução que atenda à comunidade.",
            ),
            (
                "O que ajuda uma ação coletiva a sair do papel?",
                "Definir tarefas, prazos e responsáveis em conjunto",
                "Guardar o plano em segredo",
                "Deixar todos os detalhes para o último dia",
                "a",
                "Um plano compartilhado facilita a divisão de tarefas e o acompanhamento dos prazos.",
            ),
            (
                "Depois de uma campanha de coleta seletiva, como avaliar o resultado?",
                "Contar apenas quantos cartazes foram feitos",
                "Supor que deu certo e encerrar o projeto",
                "Comparar os resultados com a meta e ouvir quem participou",
                "c",
                "Comparar dados com a meta e ouvir participantes mostra o que funcionou e o que pode melhorar.",
            ),
        ],
    ),
    (
        "Revisão da unidade",
        "Revise direitos, convivência e formas de participação.",
        [
            (
                "Qual atitude combina direito de expressão com respeito?",
                "Ameaçar quem discorda de você",
                "Impedir as pessoas de responder",
                "Apresentar argumentos e escutar outras opiniões",
                "c",
                "Você pode defender suas ideias sem ameaçar ou ofender quem pensa de forma diferente.",
            ),
            (
                "Uma reunião do bairro discutirá transporte. Como contribuir?",
                "Relatar os problemas com exemplos e propor melhorias",
                "Inventar dados para convencer os vizinhos",
                "Impedir a participação de quem usa outra linha",
                "a",
                "Exemplos concretos e propostas dão base para a comunidade discutir melhorias no transporte.",
            ),
            (
                "O que faz de uma praça um espaço público?",
                "É reservada a quem mora na rua da praça",
                "É um espaço de uso coletivo sujeito a regras de convivência",
                "É um espaço onde não existem responsabilidades",
                "b",
                "A praça pode ser usada por diferentes pessoas. Respeitar as regras de convivência ajuda a preservar esse direito.",
            ),
        ],
    ),
    (
        "Desafio final",
        "Aplique o que aprendeu em situações da escola e do bairro.",
        [
            (
                "A biblioteca da escola é pouco usada. Como planejar uma melhoria?",
                "Ouvir estudantes e equipe, definir uma meta e acompanhar o uso",
                "Fechar a biblioteca por falta de interesse",
                "Escolher um projeto sem conversar com a comunidade",
                "a",
                "Ouvir a comunidade e acompanhar o resultado ajuda a identificar mudanças que realmente facilitam o acesso à biblioteca.",
            ),
            (
                "Uma mensagem diz que um serviço público vai acabar. O que fazer?",
                "Encaminhar imediatamente para todas as turmas",
                "Conferir nos canais oficiais e pedir esclarecimentos antes de compartilhar",
                "Tratar a mensagem como verdadeira porque veio de um conhecido",
                "b",
                "Verificar a informação em fontes oficiais ajuda a evitar boatos e permite cobrar respostas com base em fatos.",
            ),
            (
                "Quem pode ajudar a fiscalizar as melhorias em um espaço público?",
                "Somente a pessoa que organizou a primeira reunião",
                "Apenas quem votou na administração atual",
                "A comunidade pode acompanhar, fazer perguntas e usar os canais públicos",
                "c",
                "Acompanhar as ações públicas e pedir informações são formas de participação abertas à comunidade.",
            ),
        ],
    ),
]

DESCRIPTIONS = {
    "cidadania": (
        "Entenda como direitos e deveres aparecem na vida cotidiana.",
        "Descubra como a participação melhora a escola, o bairro e a cidade.",
    ),
    "democracia": (
        "Conheça os princípios da participação e da representação.",
        "Pratique diálogo e decisões coletivas em situações reais.",
    ),
    "trabalhista": (
        "Conheça direitos e deveres no mundo do trabalho.",
        "Aplique os conceitos a situações do dia a dia no trabalho.",
    ),
    "desinformacao": (
        "Reconheça sinais de boatos e conteúdos enganosos.",
        "Aprenda a agir antes de repassar uma informação.",
    ),
    "checagem": (
        "Aprenda a verificar fontes, datas e contexto.",
        "Pratique a checagem de imagens e afirmações.",
    ),
    "educacao": (
        "Explore o papel da educação na vida em sociedade.",
        "Reflita sobre inclusão, convivência e participação na escola.",
    ),
}


def add_lessons(apps, schema_editor):
    db = schema_editor.connection.alias
    levels = apps.get_model("api", "Nivel").objects.using(db)
    questions = apps.get_model("api", "Pergunta").objects.using(db)
    for slug, descriptions in DESCRIPTIONS.items():
        for index, (level, description) in enumerate(
            zip(levels.filter(tema__slug=slug), descriptions)
        ):
            updates = {"descricao": description}
            if slug == "cidadania":
                updates["titulo"] = (
                    "O que é cidadania?",
                    "Participação na comunidade",
                )[index]
            levels.filter(pk=level.pk).update(**updates)
    citizenship = levels.filter(tema__slug="cidadania").first()
    if not citizenship:
        return
    last_order = levels.aggregate(last=Max("ordem"))["last"]
    for index, (title, description, items) in enumerate(EXTRA_LESSONS, 1):
        if levels.filter(tema_id=citizenship.tema_id, titulo=title).exists():
            continue
        level = levels.create(
            tema_id=citizenship.tema_id,
            titulo=title,
            descricao=description,
            ordem=last_order + index,
        )
        questions.bulk_create(
            [
                questions.model(
                    nivel=level,
                    categoria="cidadania",
                    enunciado=statement,
                    opcao_a=a,
                    opcao_b=b,
                    opcao_c=c,
                    alternativa_correta=correct,
                    explicacao=explanation,
                )
                for statement, a, b, c, correct, explanation in items
            ]
        )


class Migration(migrations.Migration):
    dependencies = (("api", "0013_quiz_aprendizagem"),)
    operations = (migrations.RunPython(add_lessons),)
