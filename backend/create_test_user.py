#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from accounts.models import User, Role
from django.contrib.auth import get_user_model

User = get_user_model()

print('Creating test user...')

try:
    reader_role = Role.objects.get(name='reader')
    user = User.objects.create_user(
        username='testuser_manual',
        email='test_manual@example.com',
        password='testpass123',
        first_name='Test',
        last_name='Manual',
        role=reader_role
    )
    print(f'User created successfully: {user.username}')
    print(f'User role: {user.role.name}')
    print(f'User email: {user.email}')
except Exception as e:
    print(f'Error creating user: {e}')
    import traceback
    traceback.print_exc()
