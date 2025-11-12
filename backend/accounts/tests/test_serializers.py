from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Role
from accounts.serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    PasswordChangeSerializer,
)

User = get_user_model()


class UserRegistrationSerializerTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.editor_role = Role.objects.create(name=Role.EDITOR, display_name='Редактор')

    def test_register_with_default_role(self):
        data = {
            'username': 'newuser1',
            'email': 'new1@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'New',
            'last_name': 'User',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertIsNotNone(user.role)
        self.assertEqual(user.role.name, Role.READER)

    def test_register_with_explicit_role(self):
        data = {
            'username': 'newuser2',
            'email': 'new2@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'New',
            'last_name': 'User',
            'role': self.editor_role.id,
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.role.name, Role.EDITOR)

    def test_register_password_mismatch(self):
        data = {
            'username': 'newuser3',
            'email': 'new3@example.com',
            'password': 'pass12345',
            'password2': 'pass00000',
            'first_name': 'New',
            'last_name': 'User',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password2', serializer.errors)

    def test_register_duplicate_email_case_insensitive(self):
        User.objects.create_user(username='x', email='dup@example.com', password='pass')
        data = {
            'username': 'newuser4',
            'email': 'Dup@Example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'New',
            'last_name': 'User',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_register_duplicate_username(self):
        User.objects.create_user(username='x1', email='x1@example.com', password='pass')
        data = {
            'username': 'x1',
            'email': 'd2@example.com',
            'password': 'pass12345',
            'password2': 'pass12345',
            'first_name': 'New',
            'last_name': 'User',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)


class AuthSerializersTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='authu', email='authu@example.com', password='pass12345')

    def test_token_pair_serializer_includes_user(self):
        serializer = CustomTokenObtainPairSerializer(data={'username': 'authu', 'password': 'pass12345'})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        data = serializer.validated_data
        self.assertIn('user', data)
        self.assertIn('access', data)
        self.assertIn('refresh', data)

    def test_password_change_serializer(self):
        factory = APIRequestFactory()
        request = factory.post('/api/v1/auth/password/change/', {})
        request.user = self.user
        serializer = PasswordChangeSerializer(
            data={'old_password': 'pass12345', 'new_password': 'newpass123', 'new_password2': 'newpass123'},
            context={'request': request}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.assertTrue(self.user.check_password('newpass123'))
