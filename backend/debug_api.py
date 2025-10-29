#!/usr/bin/env python
"""Debug API responses"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from news.models import Category, Tag

print("=" * 50)
print("Categories from database:")
categories = Category.objects.all()
print(f"Count: {categories.count()}")
for cat in categories:
    print(f"  - {cat.name} (ID: {cat.id})")

print("\nTags from database:")
tags = Tag.objects.all()
print(f"Count: {tags.count()}")
for tag in tags:
    print(f"  - {tag.name} (ID: {tag.id})")

print("\nTesting serializers:")
from news.serializers import CategorySerializer, TagSerializer

# Test CategorySerializer
category_serializer = CategorySerializer(categories, many=True)
category_data = category_serializer.data
print(f"Category serializer data type: {type(category_data)}")
print(f"Is array: {isinstance(category_data, list)}")

# Test TagSerializer
tag_serializer = TagSerializer(tags, many=True)
tag_data = tag_serializer.data
print(f"Tag serializer data type: {type(tag_data)}")
print(f"Is array: {isinstance(tag_data, list)}")
