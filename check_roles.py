#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from accounts.models import Role

print("Checking roles in database...")
print(f"Total roles: {Role.objects.count()}")

for role in Role.objects.all():
    print(f"- ID: {role.id}, Name: {role.name}, Display: {role.display_name}")

print("Available roles for registration (reader, editor):")
reader_roles = Role.objects.filter(name__in=['reader', 'editor'])
print(f"Reader/Editor roles: {reader_roles.count()}")
for role in reader_roles:
    print(f"- ID: {role.id}, Name: {role.name}, Display: {role.display_name}")
