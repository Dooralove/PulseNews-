from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from news.tasks import parse_and_create_article
from news.models import Article

User = get_user_model()


class TasksTests(TestCase):
    def test_parse_and_create_article_success(self):
        class DummyA:
            def __init__(self, url):
                self.url = url
                self.title = 'Title from site'
                self.text = 'Content from site'
            def download(self):
                pass
            def parse(self):
                pass
        with patch('news.tasks.NPArticle', DummyA):
            res = parse_and_create_article('http://example.com/post1')
            self.assertIn('created:', res)
            self.assertEqual(Article.objects.filter(source_url='http://example.com/post1').count(), 1)
        # second time should get_or_create existing
        with patch('news.tasks.NPArticle', DummyA):
            res2 = parse_and_create_article('http://example.com/post1')
            self.assertIn('created: False', res2)

    def test_parse_and_create_article_exception(self):
        class BadA:
            def __init__(self, url):
                raise RuntimeError('boom')
        with patch('news.tasks.NPArticle', BadA):
            res = parse_and_create_article('http://bad-url/')
            self.assertIn('boom', res)
