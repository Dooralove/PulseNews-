from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Role, UserActivity

User = get_user_model()


class UsersRolesViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.editor_role = Role.objects.create(name=Role.EDITOR, display_name='Редактор')
        self.admin_role = Role.objects.create(name=Role.ADMIN, display_name='Администратор')
        self.admin = User.objects.create_user(username='admin', email='admin@example.com', password='pass', role=self.admin_role)
        self.user = User.objects.create_user(username='user', email='user@example.com', password='pass', role=self.reader_role)
        self.inactive = User.objects.create_user(username='inactive', email='inactive@example.com', password='pass', role=self.reader_role, is_active=False)

    def test_users_list_scope(self):
        # non-admin sees only active users
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        usernames = [u['username'] for u in (res.data['results'] if isinstance(res.data, dict) and 'results' in res.data else res.data)]
        self.assertIn('user', usernames)
        self.assertNotIn('inactive', usernames)
        # admin sees all
        self.client.force_authenticate(user=self.admin)
        res2 = self.client.get('/api/v1/users/')
        usernames2 = [u['username'] for u in (res2.data['results'] if isinstance(res2.data, dict) and 'results' in res2.data else res2.data)]
        self.assertIn('inactive', usernames2)

    def test_roles_public_endpoint(self):
        res = self.client.get('/api/v1/roles/public/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = sorted([r['name'] for r in res.data])
        self.assertEqual(names, sorted([Role.READER, Role.EDITOR]))

    def test_activity_viewset_scope(self):
        UserActivity.objects.create(user=self.admin, action='login')
        UserActivity.objects.create(user=self.user, action='login')
        # non-admin sees only own
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/v1/activities/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        # admin sees all
        self.client.force_authenticate(user=self.admin)
        res2 = self.client.get('/api/v1/activities/')
        self.assertEqual(len(res2.data), 2)

    def test_users_my_activities_action(self):
        UserActivity.objects.create(user=self.user, action='login')
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/v1/users/my_activities/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
