#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from accounts.models import Role

print("Creating editor role if it doesn't exist...")

# Check if editor role exists
editor_role = Role.objects.filter(name='editor').first()
if editor_role:
    print(f"Editor role already exists with ID: {editor_role.id}")
else:
    # Create editor role
    editor_role = Role.objects.create(
        name='editor',
        display_name='Редактор',
        description='Может создавать и редактировать статьи'
    )
    print(f"Created editor role with ID: {editor_role.id}")

print(f"Total roles: {Role.objects.count()}")
for role in Role.objects.all():
    print(f"- ID: {role.id}, Name: {role.name}, Display: {role.display_name}")
