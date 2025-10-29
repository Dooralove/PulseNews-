import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from news.models import Article, Category
from django.contrib.auth import get_user_model
from django.utils import timezone

# Get or create test user
User = get_user_model()
user, _ = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com'}
)

# Get or create category
category, _ = Category.objects.get_or_create(
    name='Технологии',
    defaults={'description': 'Новости технологий', 'slug': 'tehnologii'}
)

# Create test articles
articles = [
    {
        'title': 'Новости Python 3.11',
        'content': 'Python 3.11 приносит улучшения производительности...',
        'slug': 'python-3-11-news'
    },
    {
        'title': 'Django 4.2 выходит',
        'content': 'Новая версия Django выходит с новыми функциями...',
        'slug': 'django-4-2-release'
    }
]

for article_data in articles:
    article, created = Article.objects.get_or_create(
        title=article_data['title'],
        defaults={
            'content': article_data['content'],
            'slug': article_data['slug'],
            'status': 'published',
            'author': user,
            'category': category,
            'published_at': timezone.now()
        }
    )
    if created:
        print(f"Создана статья: {article.title}")
    else:
        print(f"Статья уже существует: {article.title}")

print("Готово!")