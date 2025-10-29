#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from django.test import Client

print("Testing registration with fallback roles...")

client = Client()

# Test registration with reader role (ID 2)
try:
    response = client.post('/api/v1/auth/register/', {
        'username': 'testuser_reader',
        'email': 'test_reader@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'first_name': 'Test',
        'last_name': 'Reader',
        'role': 2  # reader role
    })
    print(f"Registration with reader role - Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"User created: {data['user']['username']}")
        print(f"User role: {data['user']['role']['name']}")
    else:
        print(f"Errors: {response.content}")
except Exception as e:
    print(f"Error: {e}")

# Test registration with editor role (ID 3)
try:
    response = client.post('/api/v1/auth/register/', {
        'username': 'testuser_editor',
        'email': 'test_editor@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'first_name': 'Test',
        'last_name': 'Editor',
        'role': 3  # editor role
    })
    print(f"Registration with editor role - Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"User created: {data['user']['username']}")
        print(f"User role: {data['user']['role']['name']}")
    else:
        print(f"Errors: {response.content}")
except Exception as e:
    print(f"Error: {e}")
