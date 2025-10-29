#!/usr/bin/env python
"""Reset database and populate with test data"""
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
    print("Resetting and populating database...")
    print("=" * 60)
    
    # Clear existing data
    print("\nClearing existing data...")
    Article.objects.all().delete()
    Category.objects.all().delete()
    Tag.objects.all().delete()
    print("✓ Cleared articles, categories, and tags")
    
    # Get or create admin role
    admin_role, _ = Role.objects.get_or_create(
        name=Role.ADMIN,
        defaults={
            'display_name': 'Администратор',
            'description': 'Полный доступ'
        }
    )
    print(f"\n✓ Admin role: {admin_role.display_name}")
    
    # Get or create admin user
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
        category = Category.objects.create(
            name=cat_data['name'],
            slug=cat_data['slug'],
            description=cat_data['description']
        )
        categories.append(category)
        print(f"  ✓ Created: {category.name}")
    
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
        tag = Tag.objects.create(
            name=tag_data['name'],
            slug=tag_data['slug']
        )
        tags.append(tag)
        print(f"  ✓ Created: {tag.name}")
    
    # Sample articles
    articles_data = [
        {
            'title': 'Искусственный интеллект меняет мир технологий',
            'slug': 'ai-changes-tech-world',
            'content': '''Искусственный интеллект продолжает революционизировать технологическую индустрию. 
Новые модели машинного обучения показывают впечатляющие результаты в различных областях, 
от медицины до автономного вождения.

Эксперты отмечают, что следующее десятилетие станет решающим для развития ИИ-технологий. 
Компании по всему миру инвестируют миллиарды долларов в исследования и разработки.''',
            'excerpt': 'Новые достижения в области искусственного интеллекта открывают невероятные возможности.',
            'category_index': 0,
            'tag_indices': [0, 2, 3],
        },
        {
            'title': 'Новые открытия в области квантовой физики',
            'slug': 'quantum-physics-discoveries',
            'content': '''Ученые сделали прорыв в понимании квантовых явлений. Новое исследование может изменить 
наше представление о природе реальности.

Международная группа физиков опубликовала результаты многолетних экспериментов, 
которые подтверждают существование ранее теоретических квантовых эффектов.''',
            'excerpt': 'Революционное открытие в квантовой физике открывает путь к технологиям будущего.',
            'category_index': 3,
            'tag_indices': [0, 3],
        },
        {
            'title': 'Чемпионат мира по футболу: итоги и перспективы',
            'slug': 'world-cup-results',
            'content': '''Завершился очередной чемпионат мира по футболу, который подарил болельщикам множество 
незабываемых моментов и сюрпризов.

Турнир показал высокий уровень подготовки команд и продемонстрировал новые тактические 
подходы в современном футболе.''',
            'excerpt': 'Чемпионат мира завершился триумфом и оставил яркие впечатления.',
            'category_index': 2,
            'tag_indices': [0, 2, 5],
        },
        {
            'title': 'Экологические инициативы набирают обороты',
            'slug': 'environmental-initiatives',
            'content': '''Правительства и корпорации по всему миру усиливают усилия по борьбе с изменением климата 
и защите окружающей среды.

Новые экологические программы включают переход на возобновляемые источники энергии, 
сокращение выбросов углекислого газа и защиту биоразнообразия.''',
            'excerpt': 'Мировое сообщество активизирует усилия по защите окружающей среды.',
            'category_index': 3,
            'tag_indices': [0, 1, 3],
        },
        {
            'title': 'Культурный фестиваль объединил тысячи участников',
            'slug': 'cultural-festival',
            'content': '''В столице прошел масштабный культурный фестиваль, собравший артистов и зрителей 
со всего мира.

Программа фестиваля включала театральные постановки, музыкальные концерты, 
выставки современного искусства и мастер-классы.''',
            'excerpt': 'Международный культурный фестиваль стал ярким событием сезона.',
            'category_index': 4,
            'tag_indices': [0, 5],
        },
    ]
    
    print("\nCreating articles:")
    for article_data in articles_data:
        article = Article.objects.create(
            title=article_data['title'],
            slug=article_data['slug'],
            content=article_data['content'].strip(),
            excerpt=article_data['excerpt'],
            author=author,
            category=categories[article_data['category_index']],
            status='published',
            published_at=timezone.now(),
            views=0
        )
        
        for tag_index in article_data['tag_indices']:
            article.tags.add(tags[tag_index])
        
        print(f"  ✓ Created: {article.title}")
    
    print("\n" + "=" * 60)
    print("✓ Database populated successfully!")
    print("=" * 60)
    
    # Final stats
    print(f"\nFinal statistics:")
    print(f"  Users: {User.objects.count()}")
    print(f"  Categories: {Category.objects.count()}")
    print(f"  Tags: {Tag.objects.count()}")
    print(f"  Articles: {Article.objects.count()}")
    print(f"  Published articles: {Article.objects.filter(status='published').count()}")
    
    print("\n" + "=" * 60)
    print("Admin credentials:")
    print("  Username: admin")
    print("  Password: admin123")
    print("=" * 60)

if __name__ == '__main__':
    main()
