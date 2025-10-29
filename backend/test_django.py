#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

print("Django setup test...")

# Test basic Django functionality
from django.conf import settings
print(f"DEBUG: {settings.DEBUG}")
print(f"INSTALLED_APPS: {[app for app in settings.INSTALLED_APPS if 'account' in app.lower()]}")

# Test URL resolution
from django.urls import resolve
try:
    match = resolve('/api/v1/auth/register/')
    print(f"URL resolved: {match}")
    print(f"View name: {match.view_name}")
    print(f"App name: {match.app_name}")
except Exception as e:
    print(f"URL resolution failed: {e}")

# Test model access
from accounts.models import Role, User
print(f"Roles in DB: {Role.objects.count()}")
print(f"Users in DB: {User.objects.count()}")
