# Adiciona upload no perfil e substitui os símbolos antigos pelas ilustrações do projeto.
from django.db import migrations, models


def replace_legacy_choices(apps, schema_editor):
    # Atualiza somente a ilustração; fotos por URL e demais dados do perfil são preservados.
    Profile = apps.get_model('api', 'Profile')
    for old, new in {'sun': 'portrait01', 'leaf': 'portrait02', 'star': 'portrait03', 'book': 'portrait04'}.items():
        Profile.objects.using(schema_editor.connection.alias).filter(avatar_choice=old).update(avatar_choice=new)


def restore_legacy_choices(apps, schema_editor):
    Profile = apps.get_model('api', 'Profile')
    mapping = {'portrait01': 'sun', 'portrait02': 'leaf', 'portrait03': 'star', 'portrait04': 'book'}
    for choice in range(1, 9):
        key = f'portrait{choice:02}'
        Profile.objects.using(schema_editor.connection.alias).filter(avatar_choice=key).update(avatar_choice=mapping.get(key, 'sun'))


class Migration(migrations.Migration):
    dependencies = [('api', '0005_post_media_file')]
    operations = [
        migrations.AddField(model_name='profile', name='avatar_file', field=models.FileField(blank=True, null=True, upload_to='avatars/%Y/%m/')),
        migrations.AlterField(model_name='profile', name='avatar_choice', field=models.CharField(choices=[('portrait01', 'Óculos e cabelo ondulado'), ('portrait02', 'Fones de ouvido'), ('portrait03', 'Lenço azul'), ('portrait04', 'Boné'), ('portrait05', 'Cabelo ruivo'), ('portrait06', 'Cabelo curto'), ('portrait07', 'Tranças e óculos'), ('portrait08', 'Cabelo cacheado')], default='portrait01', max_length=20)),
        migrations.RunPython(replace_legacy_choices, restore_legacy_choices),
    ]
