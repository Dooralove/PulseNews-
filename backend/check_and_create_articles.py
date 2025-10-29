#!/usr/bin/env python
"""
Script to check and create test articles
Run with: python check_and_create_articles.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from news.models import Article, Category, Tag
from accounts.models import Role

User = get_user_model()

def main():
    print("=" * 60)
    print("Checking database status...")
    print("=" * 60)
    
    # Check existing data
    print(f"\nUsers count: {User.objects.count()}")
    print(f"Categories count: {Category.objects.count()}")
    print(f"Tags count: {Tag.objects.count()}")
    print(f"Articles count: {Article.objects.count()}")
    
    if Article.objects.count() > 0:
        print("\n✓ Articles already exist:")
        for article in Article.objects.all()[:5]:
            print(f"  - {article.title} (status: {article.status})")
        return
    
    print("\n" + "=" * 60)
    print("Creating test data...")
    print("=" * 60)
    
    # Get or create admin user
    admin_role, _ = Role.objects.get_or_create(
        name=Role.ADMIN,
        defaults={
            'display_name': 'Администратор',
            'description': 'Полный доступ'
        }
    )
    print(f"\n✓ Admin role: {admin_role.display_name}")
    
    author, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@pulsenews.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': admin_role,
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    
    if created:
        author.set_password('admin123')
        author.save()
        print(f"✓ Created admin user: {author.username}")
    else:
        print(f"✓ Admin user exists: {author.username}")
    
    # Create categories
    categories_data = [
        {'name': 'Технологии', 'slug': 'tech', 'description': 'Новости из мира технологий и IT'},
        {'name': 'Политика', 'slug': 'politics', 'description': 'Политические новости и события'},
        {'name': 'Спорт', 'slug': 'sport', 'description': 'Спортивные новости и результаты'},
        {'name': 'Наука', 'slug': 'science', 'description': 'Научные открытия и исследования'},
        {'name': 'Культура', 'slug': 'culture', 'description': 'Культурные события и искусство'},
    ]
    
    categories = []
    print("\nCreating categories:")
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name'], 'description': cat_data['description']}
        )
        categories.append(category)
        status = "✓ Created" if created else "✓ Exists"
        print(f"  {status}: {category.name}")
    
    # Create tags
    tags_data = [
        {'name': 'новости', 'slug': 'news'},
        {'name': 'важное', 'slug': 'important'},
        {'name': 'обзор', 'slug': 'review'},
        {'name': 'аналитика', 'slug': 'analytics'},
        {'name': 'интервью', 'slug': 'interview'},
        {'name': 'репортаж', 'slug': 'report'},
    ]
    tags = []
    print("\nCreating tags:")
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(
            slug=tag_data['slug'],
            defaults={'name': tag_data['name']}
        )
        tags.append(tag)
        status = "✓ Created" if created else "✓ Exists"
        print(f"  {status}: {tag.name}")
    
    # Sample articles
    articles_data = [
        {
            'title': 'Искусственный интеллект меняет мир технологий',
            'content': 'Искусственный интеллект продолжает революционизировать технологическую индустрию. Новые модели машинного обучения показывают впечатляющие результаты в различных областях.',
            'excerpt': 'Новые достижения в области искусственного интеллекта открывают невероятные возможности.',
            'category_index': 0,
            'tag_indices': [0, 2, 3],
        },
        {
            'title': 'Новые открытия в области квантовой физики',
            'content': 'Ученые сделали прорыв в понимании квантовых явлений. Новое исследование может изменить наше представление о природе реальности.',
            'excerpt': 'Революционное открытие в квантовой физике открывает путь к технологиям будущего.',
            'category_index': 3,
            'tag_indices': [0, 3],
        },
        {
            'title': 'Чемпионат мира по футболу: итоги и перспективы',
            'content': 'Завершился очередной чемпионат мира по футболу, который подарил болельщикам множество незабываемых моментов и сюрпризов.',
            'excerpt': 'Чемпионат мира завершился триумфом и оставил яркие впечатления.',
            'category_index': 2,
            'tag_indices': [0, 2, 5],
        },
        {
            'title': 'Экологические инициативы набирают обороты',
            'content': 'Правительства и корпорации по всему миру усиливают усилия по борьбе с изменением климата и защите окружающей среды.',
            'excerpt': 'Мировое сообщество активизирует усилия по защите окружающей среды.',
            'category_index': 3,
            'tag_indices': [0, 1, 3],
        },
        {
            'title': 'Культурный фестиваль объединил тысячи участников',
            'content': 'В столице прошел масштабный культурный фестиваль, собравший артистов и зрителей со всего мира.',
            'excerpt': 'Международный культурный фестиваль стал ярким событием сезона.',
            'category_index': 4,
            'tag_indices': [0, 5],
        },
    ]
    
    print("\nCreating articles:")
    created_count = 0
    for article_data in articles_data:
        if Article.objects.filter(title=article_data['title']).exists():
            print(f"  ⚠ Already exists: {article_data['title']}")
            continue
        
        article = Article.objects.create(
            title=article_data['title'],
            content=article_data['content'],
            excerpt=article_data['excerpt'],
            author=author,
            category=categories[article_data['category_index']],
            status='published',
            published_at=timezone.now(),
            views=0
        )
        
        for tag_index in article_data['tag_indices']:
            article.tags.add(tags[tag_index])
        
        created_count += 1
        print(f"  ✓ Created: {article.title}")
    
    print("\n" + "=" * 60)
    print(f"✓ Successfully created {created_count} articles!")
    print("=" * 60)
    
    # Final check
    print(f"\nFinal count:")
    print(f"  Articles: {Article.objects.count()}")
    print(f"  Published articles: {Article.objects.filter(status='published').count()}")
    
    print("\nAll articles:")
    for article in Article.objects.all():
        print(f"  - {article.title}")
        print(f"    Status: {article.status}, Category: {article.category.name if article.category else 'None'}")
        print(f"    Published: {article.published_at}")

if __name__ == '__main__':
    main()
