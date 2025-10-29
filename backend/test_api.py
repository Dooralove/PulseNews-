#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from django.test import Client
from django.urls import reverse

print("Testing API endpoints...")

client = Client()

# Test roles public endpoint
try:
    response = client.get('/api/v1/roles/public/')
    print(f"Roles public endpoint status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Roles returned: {len(data)}")
        for role in data:
            print(f"  - {role}")
    else:
        print(f"Response content: {response.content}")
except Exception as e:
    print(f"Error testing roles public endpoint: {e}")

# Test registration endpoint
try:
    response = client.post('/api/v1/auth/register/', {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User',
        'role': 2  # reader role
    })
    print(f"Registration endpoint status: {response.status_code}")
    if response.status_code >= 400:
        print(f"Registration errors: {response.content}")
except Exception as e:
    print(f"Error testing registration endpoint: {e}")
