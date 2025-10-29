#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

print("Testing URL configuration...")

from django.urls import resolve, reverse
from django.conf import settings

print(f"ROOT_URLCONF: {settings.ROOT_URLCONF}")
print(f"DEBUG: {settings.DEBUG}")

# Test URL patterns
try:
    from pulse_news.urls import urlpatterns
    print(f"Main URL patterns: {len(urlpatterns)}")
    for pattern in urlpatterns:
        print(f"  - {pattern.pattern}")
except Exception as e:
    print(f"Error loading URL patterns: {e}")

# Test URL resolution
test_urls = [
    '/api/v1/auth/register/',
    '/api/v1/roles/',
    '/admin/',
    '/api/v1/auth/login/'
]

for url in test_urls:
    try:
        match = resolve(url)
        print(f"URL {url} -> {match.view_name} ({match.app_name})")
    except Exception as e:
        print(f"URL {url} -> ERROR: {e}")
