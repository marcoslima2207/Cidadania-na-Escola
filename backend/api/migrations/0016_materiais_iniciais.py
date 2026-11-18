from datetime import date

from django.db import migrations


MATERIALS = [
    ('democracia', 'Constituição em Miúdos',
     'Uma introdução ilustrada aos direitos, deveres e à participação na sociedade, voltada a jovens de 12 a 15 anos. Edição de 2024.',
     'Senado Federal', 'https://www2.senado.leg.br/jspui/handle/id/649385', 'Livro'),
    ('democracia', 'Constituição em Miúdos — atividades',
     'Propostas para trabalhar temas da Constituição na escola e relacionar direitos e cidadania ao cotidiano dos estudantes. Edição de 2022.',
     'Senado Federal', 'https://www2.senado.leg.br/jspui/handle/id/598214', 'Atividades'),
    ('democracia', 'Acompanhe a Câmara dos Deputados',
     'Consulte propostas de leis, votações e informações sobre representantes. Os dados abertos também podem ser usados em pesquisas e projetos escolares.',
     'Câmara dos Deputados', 'https://dadosabertos.camara.leg.br/', 'Dados públicos'),
    ('desinformacao', 'Cidadania Digital para adolescentes e jovens',
     'Conheça o curso da SaferNet sobre convivência, segurança e educação midiática. A participação no curso exige inscrição na plataforma indicada.',
     'SaferNet Brasil', 'https://ead.safernet.org.br/cidadaodigital/', 'Curso'),
    ('desinformacao', 'Caderno de aulas de Cidadania Digital',
     'Planos de aula e atividades para discutir o uso das tecnologias na escola, incluindo educação midiática e desinformação.',
     'SaferNet Brasil', 'https://arquivos.safernet.org.br/dap/caderno-de-aulas/caderno-disciplina-cidadania-digital-completo.pdf', 'PDF'),
    ('desinformacao', 'Jornalismo, fake news e desinformação',
     'Manual em português com conceitos, exemplos e atividades para compreender a circulação de informações enganosas e os métodos de verificação.',
     'UNESCO', 'https://unesdoc.unesco.org/ark:/48223/pf0000368647', 'Manual'),
    ('checagem', 'Google Fact Check Explorer',
     'Pesquise um assunto para encontrar checagens já publicadas. Compare a afirmação, a data, a conclusão e as evidências apresentadas pela fonte.',
     'Google', 'https://toolbox.google.com/factcheck/explorer', 'Ferramenta'),
    ('checagem', 'Fato ou Boato',
     'Busque esclarecimentos e checagens sobre eleições. O portal reúne análises, recomendações e materiais educativos da Justiça Eleitoral.',
     'Justiça Eleitoral', 'https://www.justicaeleitoral.jus.br/fato-ou-boato/', 'Checagens'),
    ('checagem', 'Checagens do Aos Fatos',
     'Explore análises de afirmações que circulam nas redes e acompanhe as fontes e evidências citadas em cada publicação.',
     'Aos Fatos', 'https://www.aosfatos.org/noticias/', 'Checagens'),
    ('trabalhista', 'Guia do Jovem Aprendiz',
     'Material introdutório sobre aprendizagem profissional, com orientações para estudantes que estão conhecendo o mundo do trabalho. Segunda edição.',
     'Tribunal Superior do Trabalho', 'https://www.tst.jus.br/documents/2237892/0/Guia%2Bjovem%2Baprendiz%2Bsegunda%2Bedicao%2B2.pdf/720d3bce-78c1-d2e1-4719-5eecfeb0b313?t=1602629556268', 'PDF'),
    ('trabalhista', 'Consolidação das Leis do Trabalho',
     'Consulte o texto atualizado da CLT e as referências às leis que alteraram seus artigos, na base de legislação da Câmara dos Deputados.',
     'Câmara dos Deputados', 'https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-5452-1-maio-1943-415500-normaatualizada-pe.html', 'Legislação'),
    ('trabalhista', 'Carteira de Trabalho Digital',
     'Entenda o documento que registra a vida profissional e consulte as orientações oficiais para obter e acessar a Carteira de Trabalho Digital.',
     'Ministério do Trabalho e Emprego', 'https://www.gov.br/pt-br/servicos/obter-a-carteira-de-trabalho', 'Serviço público'),
]


def add_materials(apps, schema_editor):
    material = apps.get_model('api', 'MaterialEducativo')
    for category, title, summary, source, url, kind in MATERIALS:
        material.objects.using(schema_editor.connection.alias).get_or_create(
            url=url,
            defaults={
                'categoria': category, 'titulo': title, 'resumo': summary,
                'fonte': source, 'formato': kind, 'conferido_em': date(2026, 11, 18),
            },
        )


class Migration(migrations.Migration):
    dependencies = [('api', '0015_biblioteca_materiais')]
    operations = [migrations.RunPython(add_materials, migrations.RunPython.noop)]
