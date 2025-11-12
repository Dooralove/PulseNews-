from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework import serializers
from django.contrib.auth import get_user_model
from news.models import Article, Category, Tag, Reaction, Bookmark
from news.serializers import (
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateUpdateSerializer,
    CategorySerializer,
    ReactionSerializer,
    BookmarkSerializer,
)

User = get_user_model()


class NewsSerializersTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.reader = User.objects.create_user(username='reader', email='r@example.com', password='pass')
        self.staff = User.objects.create_user(username='staff', email='s@example.com', password='pass', is_staff=True)
        self.category = Category.objects.create(name='Tech')
        self.tag1 = Tag.objects.create(name='AI')
        self.tag2 = Tag.objects.create(name='ML')

    def test_article_list_and_detail_counts(self):
        a = Article.objects.create(title='T', content='C', category=self.category, author=self.reader, status='published')
        a.tags.add(self.tag1, self.tag2)
        req = self.factory.get('/')
        data = ArticleListSerializer(a, context={'request': req}).data
        self.assertEqual(data['likes_count'], 0)
        self.assertEqual(data['dislikes_count'], 0)
        dser = ArticleDetailSerializer(a, context={'request': req})
        _ = dser.data
        a.refresh_from_db()
        self.assertEqual(a.views, 1)

    def test_article_create_update_permissions(self):
        # Non-privileged user cannot create
        req = self.factory.post('/')
        req.user = self.reader
        ser = ArticleCreateUpdateSerializer(
            data={'title': 'T', 'content': 'C', 'category': self.category.id, 'tags': [self.tag1.id]},
            context={'request': req}
        )
        self.assertFalse(ser.is_valid())
        # Staff can create
        req.user = self.staff
        ser = ArticleCreateUpdateSerializer(
            data={'title': 'T', 'content': 'C', 'category': self.category.id, 'tags': [self.tag1.id], 'status': 'draft'},
            context={'request': req}
        )
        self.assertTrue(ser.is_valid(), ser.errors)
        art = ser.save()
        # Only author or staff can update
        other = User.objects.create_user(username='o', email='o@example.com', password='pass')
        req_put = self.factory.patch('/')
        req_put.user = other
        ser2 = ArticleCreateUpdateSerializer(art, data={'title': 'N'}, partial=True, context={'request': req_put})
        self.assertTrue(ser2.is_valid(), ser2.errors)
        with self.assertRaises(serializers.ValidationError):
            ser2.save()

    def test_category_serializer_create_requires_staff(self):
        req = self.factory.post('/')
        req.user = self.reader
        ser = CategorySerializer(data={'name': 'NewCat'}, context={'request': req})
        with self.assertRaises(serializers.ValidationError):
            ser.is_valid(raise_exception=True)
            ser.save()
        req.user = self.staff
        ser = CategorySerializer(data={'name': 'NewCat2'}, context={'request': req})
        self.assertTrue(ser.is_valid(), ser.errors)
        self.assertIsNotNone(ser.save())

    def test_reaction_serializer_create_and_validate(self):
        a = Article.objects.create(title='T', content='C', category=self.category, author=self.reader, status='published')
        req = self.factory.post('/')
        req.user = self.reader
        ser = ReactionSerializer(data={'article': a.id, 'value': 1}, context={'request': req})
        self.assertTrue(ser.is_valid(), ser.errors)
        r = ser.save()
        self.assertEqual(r.value, Reaction.LIKE)
        # Update existing reaction
        ser2 = ReactionSerializer(data={'article': a.id, 'value': -1}, context={'request': req})
        self.assertTrue(ser2.is_valid(), ser2.errors)
        r2 = ser2.save()
        self.assertEqual(r2.value, Reaction.DISLIKE)
        # Validate invalid value
        ser3 = ReactionSerializer(data={'article': a.id, 'value': 2}, context={'request': req})
        self.assertFalse(ser3.is_valid())

    def test_bookmark_serializer_toggle(self):
        a = Article.objects.create(title='T', content='C', category=self.category, author=self.reader, status='published')
        req = self.factory.post('/')
        req.user = self.reader
        ser = BookmarkSerializer(data={'article_id': a.id}, context={'request': req})
        self.assertTrue(ser.is_valid(), ser.errors)
        b = ser.save()
        self.assertEqual(b.article_id, a.id)
        # Second call should remove and raise ValidationError
        ser2 = BookmarkSerializer(data={'article_id': a.id}, context={'request': req})
        self.assertTrue(ser2.is_valid(), ser2.errors)
        with self.assertRaises(serializers.ValidationError):
            ser2.save()
