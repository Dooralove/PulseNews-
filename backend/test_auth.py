#!/usr/bin/env python
"""Test login via Django shell"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from django.contrib.auth import authenticate
from accounts.models import User

# Test authentication
user = authenticate(username='admin', password='admin123')
if user:
    print(f"✓ Authentication successful: {user.username}")
    print(f"  Role: {user.role.name if user.role else 'No role'}")
    print(f"  Can manage articles: {user.can_manage_articles()}")
    print(f"  Is staff: {user.is_staff}")
    print(f"  Is active: {user.is_active}")
else:
    print("✗ Authentication failed")

# Check if user exists
try:
    admin_user = User.objects.get(username='admin')
    print(f"\nUser exists: {admin_user.username}")
    print(f"  Password valid: {admin_user.check_password('admin123')}")
    print(f"  Is active: {admin_user.is_active}")
except User.DoesNotExist:
    print("\n✗ User 'admin' does not exist")
