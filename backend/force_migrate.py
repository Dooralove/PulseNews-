#!/usr/bin/env python
"""Force create migrations and apply them"""
import os
import sys
import django
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

print("=" * 60)
print("Force creating migrations...")
print("=" * 60)

try:
    print("\n1. Making migrations for accounts...")
    call_command('makemigrations', 'accounts', verbosity=2)
    
    print("\n2. Making migrations for news...")
    call_command('makemigrations', 'news', verbosity=2)
    
    print("\n3. Applying migrations...")
    call_command('migrate', verbosity=2)
    
    print("\n" + "=" * 60)
    print("✓ Migrations completed successfully!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
