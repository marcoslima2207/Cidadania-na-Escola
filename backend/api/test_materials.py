from collections import Counter
from importlib import import_module
from types import SimpleNamespace

from django.apps import apps
from django.db import connection
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import MaterialEducativo


class MaterialLibraryTests(APITestCase):
    def test_seed_is_public_has_sources_and_covers_all_topics(self):
        response = self.client.get(reverse('material-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Counter(m['categoria'] for m in response.data), {
            'democracia': 3, 'desinformacao': 3, 'checagem': 3, 'trabalhista': 3,
        })
        for material in response.data:
            self.assertTrue(material['url'].startswith('https://'))
            self.assertTrue(material['fonte'])
            self.assertTrue(material['resumo'])
            self.assertEqual(material['conferido_em'], '2026-11-18')

    def test_topic_filter_and_unknown_topic(self):
        url = reverse('material-list')
        for category in ('democracia', 'desinformacao', 'checagem', 'trabalhista'):
            response = self.client.get(url, {'categoria': category})
            self.assertEqual(len(response.data), 3)
            self.assertTrue(all(m['categoria'] == category for m in response.data))
        self.assertEqual(self.client.get(url, {'categoria': 'inexistente'}).data, [])

    def test_public_cannot_change_curated_sources(self):
        material = MaterialEducativo.objects.first()
        detail = reverse('material-detail', args=[material.pk])
        for response in (
            self.client.post(reverse('material-list'), {'titulo': 'Outro'}),
            self.client.patch(detail, {'url': 'https://example.com/'}),
            self.client.delete(detail),
        ):
            self.assertEqual(response.status_code, 405)
        self.assertEqual(MaterialEducativo.objects.count(), 12)

    def test_seed_can_be_retried_without_duplicate_or_overwrite(self):
        material = MaterialEducativo.objects.first()
        material.resumo = 'Texto revisado pela equipe.'
        material.save(update_fields=['resumo'])
        seed = import_module('api.migrations.0016_materiais_iniciais')
        seed.add_materials(apps, SimpleNamespace(connection=connection))
        self.assertEqual(MaterialEducativo.objects.count(), 12)
        material.refresh_from_db()
        self.assertEqual(material.resumo, 'Texto revisado pela equipe.')
