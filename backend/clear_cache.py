#!/usr/bin/env python
"""Clear Django cache"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from django.core.cache import cache

print("Clearing Django cache...")
cache.clear()
print("✓ Cache cleared successfully!")
