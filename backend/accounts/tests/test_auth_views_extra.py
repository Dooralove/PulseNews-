from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()


class AccountsAuthViewsExtraTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_invalid_returns_400(self):
        url = '/api/v1/auth/register/'
        res = self.client.post(url, {
            'username': 'bad',
            'email': 'bad@example.com',
            'password': 'p1',
            'password2': 'p2',
            'first_name': 'A',
            'last_name': 'B',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_exception_branch(self):
        user = User.objects.create_user(username='u', email='u@example.com', password='pass12345')
        login = self.client.post('/api/v1/auth/login/', {'username': 'u', 'password': 'pass12345'}, format='json')
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        refresh = login.data['refresh']
        with patch('accounts.views.User.objects.get', side_effect=Exception('boom')):
            res = self.client.post('/api/v1/auth/token/refresh/', {'refresh': refresh}, format='json')
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertNotIn('user', res.data)

    def test_logout_missing_and_invalid(self):
        user = User.objects.create_user(username='p', email='p@example.com', password='pass12345')
        self.client.force_authenticate(user=user)
        res_missing = self.client.post('/api/v1/auth/logout/', {}, format='json')
        self.assertEqual(res_missing.status_code, status.HTTP_400_BAD_REQUEST)
        res_bad = self.client.post('/api/v1/auth/logout/', {'refresh': 'bad'}, format='json')
        self.assertEqual(res_bad.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_delete(self):
        user = User.objects.create_user(username='d', email='d@example.com', password='pass12345')
        self.client.force_authenticate(user=user)
        res = self.client.delete('/api/v1/auth/profile/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='d').exists())

    def test_password_change_invalid_old_password(self):
        user = User.objects.create_user(username='pp', email='pp@example.com', password='pass12345')
        self.client.force_authenticate(user=user)
        res = self.client.post('/api/v1/auth/password/change/', {
            'old_password': 'wrong', 'new_password': 'newpass123', 'new_password2': 'newpass123'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
