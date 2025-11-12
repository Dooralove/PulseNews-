from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework import status
from accounts.models import Role, UserActivity

User = get_user_model()


class AccountsViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.editor_role = Role.objects.create(name=Role.EDITOR, display_name='Редактор')
        self.admin_role = Role.objects.create(name=Role.ADMIN, display_name='Администратор')

    def test_registration_endpoint(self):
        url = '/api/v1/auth/register/'
        res = self.client.post(url, {
            'username': 'apiuser',
            'email': 'api@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'A',
            'last_name': 'B',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', res.data)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_login_and_activity_logged(self):
        user = User.objects.create_user(username='logu', email='logu@example.com', password='pass12345')
        url = '/api/v1/auth/login/'
        res = self.client.post(url, {'username': 'logu', 'password': 'pass12345'}, format='json', REMOTE_ADDR='8.8.8.8')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(UserActivity.objects.filter(user=user, action='login').count(), 1)
        user.refresh_from_db()
        self.assertEqual(user.last_login_ip, '8.8.8.8')

    def test_token_refresh_returns_user(self):
        user = User.objects.create_user(username='rfu', email='rfu@example.com', password='pass12345')
        login_res = self.client.post('/api/v1/auth/login/', {'username': 'rfu', 'password': 'pass12345'}, format='json')
        refresh = login_res.data['refresh']
        res = self.client.post('/api/v1/auth/token/refresh/', {'refresh': refresh}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('user', res.data)

    def test_profile_me_and_change_password_and_logout(self):
        user = User.objects.create_user(username='p', email='p@example.com', password='pass12345')
        self.client.force_authenticate(user=user)
        res_me = self.client.get('/api/v1/users/me/')
        self.assertEqual(res_me.status_code, status.HTTP_200_OK)
        res_chg = self.client.post('/api/v1/auth/password/change/', {
            'old_password': 'pass12345', 'new_password': 'pass54321', 'new_password2': 'pass54321'
        }, format='json')
        self.assertEqual(res_chg.status_code, status.HTTP_200_OK)
        login_res = self.client.post('/api/v1/auth/login/', {'username': 'p', 'password': 'pass54321'}, format='json')
        refresh = login_res.data['refresh']
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_res.data['access']}")
        res_logout = self.client.post('/api/v1/auth/logout/', {'refresh': refresh}, format='json')
        self.assertIn(res_logout.status_code, [status.HTTP_205_RESET_CONTENT, status.HTTP_200_OK])
