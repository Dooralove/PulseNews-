from django.test import TestCase
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from news.models import Category, Tag, Article, Comment, Reaction, Bookmark

User = get_user_model()


class NewsModelsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass')
        self.category = Category.objects.create(name='Tech')
        self.tag = Tag.objects.create(name='AI')

    def test_category_and_tag_slug_autofill(self):
        self.assertTrue(self.category.slug)
        self.assertTrue(self.tag.slug)

    def test_article_publish_and_unpublish(self):
        a = Article.objects.create(title='T', content='C', category=self.category, author=self.user)
        self.assertEqual(a.status, 'draft')
        self.assertIsNone(a.published_at)
        a.status = 'published'
        a.save()
        self.assertIsNotNone(a.published_at)
        a.status = 'draft'
        a.save()
        self.assertIsNone(a.published_at)

    def test_reaction_and_bookmark_unique(self):
        art = Article.objects.create(title='A', content='x', category=self.category, author=self.user)
        Reaction.objects.create(article=art, user=self.user, value=Reaction.LIKE)
        with self.assertRaises(IntegrityError):
            Reaction.objects.create(article=art, user=self.user, value=Reaction.DISLIKE)
        Bookmark.objects.create(article=art, user=self.user)
        with self.assertRaises(IntegrityError):
            Bookmark.objects.create(article=art, user=self.user)

    def test_comment_str(self):
        art = Article.objects.create(title='B', content='x', category=self.category, author=self.user)
        c = Comment.objects.create(article=art, author=self.user, content='hi')
        self.assertIn(self.user.username, str(c))
