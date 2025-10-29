#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from django.test import Client

print("Testing API with Django test client...")

client = Client()

# Test registration
print("\n=== Testing Registration ===")
response = client.post('/api/v1/auth/register/', {
    'username': 'testuser_api',
    'email': 'test_api@example.com',
    'password': 'testpass123',
    'password2': 'testpass123',
    'first_name': 'Test',
    'last_name': 'API',
    'role': 2
})

print(f"Status: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type', 'Not set')}")
print(f"Response length: {len(response.content)}")

if response.status_code == 201:
    print("SUCCESS: User created!")
    try:
        data = response.json()
        print(f"User: {data.get('user', {}).get('username')}")
        print(f"Role: {data.get('user', {}).get('role', {}).get('name')}")
    except:
        print(f"Raw response: {response.content}")
else:
    print("FAILED: Registration failed")
    print(f"Response: {response.content}")

# Test roles
print("\n=== Testing Roles ===")
response = client.get('/api/v1/roles/')

print(f"Status: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type', 'Not set')}")

if response.status_code == 200:
    try:
        data = response.json()
        print(f"Roles returned: {len(data)}")
        for role in data:
            print(f"  - {role}")
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        print(f"Raw response: {response.content}")
else:
    print(f"Response: {response.content}")
