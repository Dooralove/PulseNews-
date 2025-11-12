from django.test import TestCase
from django.urls import reverse
from django.db.models import Q
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from news.models import Article, Category, Tag, Comment, Reaction

User = get_user_model()


class ArticleViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader = User.objects.create_user(username='reader', email='r@example.com', password='pass')
        self.staff = User.objects.create_user(username='staff', email='s@example.com', password='pass', is_staff=True)
        self.other = User.objects.create_user(username='other', email='o@example.com', password='pass')
        self.category = Category.objects.create(name='Tech')
        self.t1 = Tag.objects.create(name='ai')
        self.t2 = Tag.objects.create(name='ml')
        self.pub = Article.objects.create(title='Pub', content='About AI', category=self.category, author=self.other, status='published')
        self.pub.tags.add(self.t1)
        self.draft_other = Article.objects.create(title='D1', content='Hidden', category=self.category, author=self.other, status='draft')
        self.draft_reader = Article.objects.create(title='D2', content='Mine', category=self.category, author=self.reader, status='draft')

    def test_list_visibility_unauthenticated(self):
        res = self.client.get('/api/v1/articles/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertIn(self.pub.id, ids)
        self.assertNotIn(self.draft_other.id, ids)
        self.assertNotIn(self.draft_reader.id, ids)

    def test_list_visibility_authenticated(self):
        self.client.force_authenticate(user=self.reader)
        res = self.client.get('/api/v1/articles/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertIn(self.pub.id, ids)
        self.assertIn(self.draft_reader.id, ids)
        self.assertNotIn(self.draft_other.id, ids)

    def test_list_visibility_staff(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/v1/articles/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertIn(self.pub.id, ids)
        self.assertIn(self.draft_reader.id, ids)
        self.assertIn(self.draft_other.id, ids)

    def test_status_filters(self):
        # published
        res = self.client.get('/api/v1/articles/?status=published')
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertEqual(ids, [self.pub.id])
        # draft unauthenticated -> none
        res = self.client.get('/api/v1/articles/?status=draft')
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertEqual(len(ids), 0)
        # draft authenticated -> own
        self.client.force_authenticate(user=self.reader)
        res = self.client.get('/api/v1/articles/?status=draft')
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertEqual(ids, [self.draft_reader.id])

    def test_tag_and_search_filters(self):
        res = self.client.get(f'/api/v1/articles/?tags={self.t1.slug}')
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertIn(self.pub.id, ids)
        res = self.client.get('/api/v1/articles/?search=About')
        ids = [x['id'] for x in res.data['results']] if isinstance(res.data, dict) and 'results' in res.data else [x['id'] for x in res.data]
        self.assertIn(self.pub.id, ids)

    def test_article_create_permissions(self):
        # unauthenticated
        res = self.client.post('/api/v1/articles/', {'title': 'X', 'content': 'Y', 'category': self.category.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        # reader forbidden
        self.client.force_authenticate(user=self.reader)
        res = self.client.post('/api/v1/articles/', {'title': 'X', 'content': 'Y', 'category': self.category.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        # staff allowed
        self.client.force_authenticate(user=self.staff)
        res = self.client.post('/api/v1/articles/', {'title': 'X', 'content': 'Y', 'category': self.category.id, 'tags': [self.t1.id]}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'X')

    def test_publish_and_unpublish_actions(self):
        self.client.force_authenticate(user=self.other)
        res = self.client.post(f'/api/v1/articles/{self.draft_other.id}/publish/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'published')
        res = self.client.post(f'/api/v1/articles/{self.draft_other.id}/unpublish/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'draft')
        # reader cannot publish other's
        self.client.force_authenticate(user=self.reader)
        res = self.client.post(f'/api/v1/articles/{self.draft_other.id}/publish/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_article_detail_increments_views(self):
        start = self.pub.views
        res = self.client.get(f'/api/v1/articles/{self.pub.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.pub.refresh_from_db()
        self.assertEqual(self.pub.views, start + 1)


class CommentReactionBookmarkViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader = User.objects.create_user(username='reader', email='r@example.com', password='pass')
        self.moderator = User.objects.create_user(username='mod', email='m@example.com', password='pass', is_staff=True)
        self.category = Category.objects.create(name='Tech')
        self.article = Article.objects.create(title='A', content='C', category=self.category, author=self.reader, status='published')

    def test_comments_list_create_and_visibility(self):
        # unauthenticated can list
        res = self.client.get('/api/v1/comments/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # create requires auth
        res = self.client.post('/api/v1/comments/', {'article': self.article.id, 'content': 'Hi'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(user=self.reader)
        res = self.client.post('/api/v1/comments/', {'article': self.article.id, 'content': 'Hi'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        cid = res.data['id']
        # replies appear in article view with article param
        res2 = self.client.get(f'/api/v1/comments/?article={self.article.id}')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        # make it inactive
        Comment.objects.filter(id=cid).update(is_active=False)
        # non-moderator shouldn't see inactive
        res3 = self.client.get(f'/api/v1/comments/?article={self.article.id}')
        self.assertEqual(len(res3.data), 0)
        # moderator should see inactive through direct queryset? View hides for non-moderators only
        self.client.force_authenticate(user=self.moderator)
        res4 = self.client.get(f'/api/v1/comments/?article={self.article.id}')
        self.assertEqual(res4.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res4.data), 1)

    def test_nested_article_comments(self):
        self.client.force_authenticate(user=self.reader)
        res = self.client.post(f'/api/v1/articles/{self.article.id}/comments/', {'content': 'Top'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        parent_id = res.data['id']
        res2 = self.client.post(f'/api/v1/articles/{self.article.id}/comments/', {'content': 'Reply', 'parent': parent_id}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.client.force_authenticate(user=None)
        res3 = self.client.get(f'/api/v1/articles/{self.article.id}/comments/')
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res3.data), 1)  # only top-level

    def test_reactions_and_my_reaction(self):
        self.client.force_authenticate(user=self.reader)
        res = self.client.post(f'/api/v1/articles/{self.article.id}/reactions/', {'value': 1}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res2 = self.client.get(f'/api/v1/articles/{self.article.id}/reactions/my_reaction/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data.get('value'), 1)
        # update reaction
        res3 = self.client.post(f'/api/v1/articles/{self.article.id}/reactions/', {'value': -1}, format='json')
        self.assertIn(res3.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        res4 = self.client.get(f'/api/v1/articles/{self.article.id}/reactions/my_reaction/')
        self.assertEqual(res4.data.get('value'), -1)
        # when absent
        self.client.force_authenticate(user=None)
        res5 = self.client.get(f'/api/v1/articles/{self.article.id}/reactions/my_reaction/')
        # unauthenticated will raise 401 at permission, so test logged in other user with no reaction
        other = User.objects.create_user(username='noreact', email='nr@example.com', password='pass')
        self.client.force_authenticate(user=other)
        res6 = self.client.get(f'/api/v1/articles/{self.article.id}/reactions/my_reaction/')
        self.assertEqual(res6.status_code, status.HTTP_200_OK)
        self.assertIsNone(res6.data.get('value'))

    def test_bookmarks_toggle_and_check(self):
        self.client.force_authenticate(user=self.reader)
        res = self.client.post('/api/v1/bookmarks/', {'article_id': self.article.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res_chk = self.client.get(f'/api/v1/bookmarks/check/?article_id={self.article.id}')
        self.assertEqual(res_chk.status_code, status.HTTP_200_OK)
        self.assertTrue(res_chk.data.get('is_bookmarked'))
        # toggle remove
        res2 = self.client.post('/api/v1/bookmarks/', {'article_id': self.article.id}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        # missing param
        res_bad = self.client.get('/api/v1/bookmarks/check/')
        self.assertEqual(res_bad.status_code, status.HTTP_400_BAD_REQUEST)


class TagCategoryPermissionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader = User.objects.create_user(username='reader', email='r@example.com', password='pass')
        self.staff = User.objects.create_user(username='staff', email='s@example.com', password='pass', is_staff=True)

    def test_tag_create_permissions(self):
        # reader cannot
        self.client.force_authenticate(user=self.reader)
        res = self.client.post('/api/v1/tags/', {'name': 'newtag'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        # staff can
        self.client.force_authenticate(user=self.staff)
        res2 = self.client.post('/api/v1/tags/', {'name': 'newtag'}, format='json')
        self.assertIn(res2.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])

    def test_category_create_permissions(self):
        # reader cannot
        self.client.force_authenticate(user=self.reader)
        res = self.client.post('/api/v1/categories/', {'name': 'NewC'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        # staff can
        self.client.force_authenticate(user=self.staff)
        res2 = self.client.post('/api/v1/categories/', {'name': 'NewC2'}, format='json')
        self.assertIn(res2.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
