from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from news import auth_views

User = get_user_model()


class NewsAuthViewsDirectTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass12345', first_name='F', last_name='L')

    def test_register_success_and_invalid(self):
        view = auth_views.UserRegistrationView.as_view()
        req = self.factory.post('/auth/register/', {
            'username': 'newu',
            'email': 'nu@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'A',
            'last_name': 'B',
        }, format='json')
        res = view(req)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

        # invalid (password mismatch)
        req2 = self.factory.post('/auth/register/', {
            'username': 'bad',
            'email': 'bad@example.com',
            'password': 'p1',
            'password2': 'p2',
            'first_name': 'A',
            'last_name': 'B',
        }, format='json')
        res2 = view(req2)
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        view = auth_views.CustomTokenObtainPairView.as_view()
        req = self.factory.post('/auth/login/', {'username': 'u', 'password': 'pass12345'}, format='json')
        res = view(req)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_refresh_success_and_exception_branch(self):
        # obtain token first
        obtain = auth_views.CustomTokenObtainPairView.as_view()
        req = self.factory.post('/auth/login/', {'username': 'u', 'password': 'pass12345'}, format='json')
        res = obtain(req)
        refresh = res.data['refresh']

        # success path
        refresh_view = auth_views.CustomTokenRefreshView.as_view()
        req_r = self.factory.post('/auth/token/refresh/', {'refresh': refresh}, format='json')
        res_r = refresh_view(req_r)
        self.assertEqual(res_r.status_code, status.HTTP_200_OK)
        self.assertIn('user', res_r.data)

        # exception branch: mock User.objects.get to raise while status stays 200
        from unittest.mock import patch
        with patch('news.auth_views.User.objects.get', side_effect=Exception('boom')):
            req_r2 = self.factory.post('/auth/token/refresh/', {'refresh': refresh}, format='json')
            res_r2 = refresh_view(req_r2)
            self.assertEqual(res_r2.status_code, status.HTTP_200_OK)
            # user not injected due to exception
            self.assertNotIn('user', res_r2.data)

    def test_profile_get_and_patch(self):
        view = auth_views.UserProfileView.as_view()
        req_g = self.factory.get('/auth/profile/')
        force_authenticate(req_g, user=self.user)
        res_g = view(req_g)
        self.assertEqual(res_g.status_code, status.HTTP_200_OK)
        self.assertEqual(res_g.data['username'], 'u')

        req_p = self.factory.patch('/auth/profile/', {'first_name': 'New'}, format='json')
        force_authenticate(req_p, user=self.user)
        res_p = view(req_p)
        self.assertEqual(res_p.status_code, status.HTTP_200_OK)
        self.assertEqual(res_p.data['first_name'], 'New')

    def test_logout_valid_and_invalid(self):
        view = auth_views.LogoutView.as_view()
        refresh = str(RefreshToken.for_user(self.user))
        # valid
        req_v = self.factory.post('/auth/logout/', {'refresh': refresh}, format='json')
        force_authenticate(req_v, user=self.user)
        res_v = view(req_v)
        self.assertIn(res_v.status_code, [status.HTTP_205_RESET_CONTENT, status.HTTP_200_OK])
        # missing refresh
        req_m = self.factory.post('/auth/logout/', {}, format='json')
        force_authenticate(req_m, user=self.user)
        res_m = view(req_m)
        self.assertEqual(res_m.status_code, status.HTTP_400_BAD_REQUEST)
        # invalid
        req_b = self.factory.post('/auth/logout/', {'refresh': 'bad'}, format='json')
        force_authenticate(req_b, user=self.user)
        res_b = view(req_b)
        self.assertEqual(res_b.status_code, status.HTTP_400_BAD_REQUEST)
