from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from news.models import Article, Category, Tag
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Adds test articles to the database'

    def handle(self, *args, **options):
        # Create a test user if not exists
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'is_active': True,
                'is_staff': False,
                'is_superuser': False
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created test user'))

        # Create a test category if not exists
        category, _ = Category.objects.get_or_create(
            name='Технологии',
            defaults={
                'description': 'Новости из мира технологий и IT',
                'slug': 'tehnologii'
            }
        )

        # Create some test tags
        tag1, _ = Tag.objects.get_or_create(name='python', slug='python')
        tag2, _ = Tag.objects.get_or_create(name='django', slug='django')
        tag3, _ = Tag.objects.get_or_create(name='искусственный интеллект', slug='iskusstvennyj-intellekt')

        # Test articles data
        articles_data = [
            {
                'title': 'Новости Python 3.11: Что нового?',
                'content': 'Python 3.11 приносит значительные улучшения производительности и новые синтаксические возможности...',
                'excerpt': 'Обзор нововведений в Python 3.11',
                'status': 'published',
                'tags': [tag1]
            },
            {
                'title': 'Django 4.2: Новые возможности',
                'content': 'Django 4.2 выходит с новыми функциями, включая улучшенную поддержку асинхронности...',
                'excerpt': 'Что нового в Django 4.2',
                'status': 'published',
                'tags': [tag1, tag2]
            },
            {
                'title': 'Будущее искусственного интеллекта',
                'content': 'Искусственный интеллект продолжает развиваться семимильными шагами. В этой статье мы рассмотрим...',
                'excerpt': 'Перспективы развития ИИ в ближайшие годы',
                'status': 'published',
                'tags': [tag3]
            },
            {
                'title': 'Лучшие практики Django REST Framework',
                'content': 'В этой статье мы рассмотрим лучшие практики работы с Django REST Framework...',
                'excerpt': 'Как писать чистый и поддерживаемый код на DRF',
                'status': 'published',
                'tags': [tag1, tag2]
            },
            {
                'title': 'Асинхронность в Python',
                'content': 'Асинхронное программирование в Python с использованием asyncio...',
                'excerpt': 'Полное руководство по асинхронности в Python',
                'status': 'draft',
                'tags': [tag1]
            }
        ]

        # Create articles
        for i, article_data in enumerate(articles_data, 1):
            slug = f"{article_data['title'].lower().replace(' ', '-')[:50]}-{i}"
            article = Article.objects.create(
                title=article_data['title'],
                slug=slug,
                content=article_data['content'],
                excerpt=article_data['excerpt'],
                status=article_data['status'],
                author=user,
                category=category,
                published_at=timezone.now()
            )
            article.tags.set(article_data['tags'])
            self.stdout.write(self.style.SUCCESS(f'Created article: {article.title}'))

        self.stdout.write(self.style.SUCCESS('Successfully added test articles'))
