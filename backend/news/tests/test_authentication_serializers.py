from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import serializers
from news.authentication import (
    UserRegistrationSerializer as NewsUserRegistrationSerializer,
    CustomTokenObtainPairSerializer as NewsTokenObtainPairSerializer,
    UserProfileSerializer as NewsUserProfileSerializer,
)

User = get_user_model()


class NewsAuthenticationSerializersTests(TestCase):
    def test_registration_success_and_errors(self):
        # success
        data = {
            'username': 'nu1',
            'email': 'nu1@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'A',
            'last_name': 'B',
        }
        ser = NewsUserRegistrationSerializer(data=data)
        self.assertTrue(ser.is_valid(), ser.errors)
        user = ser.save()
        self.assertTrue(User.objects.filter(username='nu1').exists())
        
        # duplicate email
        data2 = {
            'username': 'nu2',
            'email': 'nu1@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'A',
            'last_name': 'B',
        }
        ser2 = NewsUserRegistrationSerializer(data=data2)
        self.assertFalse(ser2.is_valid())
        self.assertIn('email', ser2.errors)
        
        # duplicate username
        data3 = {
            'username': 'nu1',
            'email': 'nu3@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'A',
            'last_name': 'B',
        }
        ser3 = NewsUserRegistrationSerializer(data=data3)
        self.assertFalse(ser3.is_valid())
        self.assertIn('username', ser3.errors)
        
        # password mismatch
        data4 = {
            'username': 'nu4',
            'email': 'nu4@example.com',
            'password': 'pass1',
            'password2': 'pass2',
            'first_name': 'A',
            'last_name': 'B',
        }
        ser4 = NewsUserRegistrationSerializer(data=data4)
        self.assertFalse(ser4.is_valid())
        self.assertIn('password', ser4.errors)

    def test_token_obtain_pair_includes_user(self):
        user = User.objects.create_user(username='authn', email='authn@example.com', password='pass12345')
        ser = NewsTokenObtainPairSerializer(data={'username': 'authn', 'password': 'pass12345'})
        self.assertTrue(ser.is_valid(), ser.errors)
        data = ser.validated_data
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertIn('user', data)
        self.assertIn('can_manage_articles', data['user'])

    def test_user_profile_serializer_can_manage_articles(self):
        u1 = User.objects.create_user(username='r', email='r@example.com', password='pass')
        ser1 = NewsUserProfileSerializer(u1)
        self.assertFalse(ser1.data['can_manage_articles'])
        u2 = User.objects.create_user(username='s', email='s@example.com', password='pass', is_staff=True)
        ser2 = NewsUserProfileSerializer(u2)
        self.assertTrue(ser2.data['can_manage_articles'])
