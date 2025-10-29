from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from news.models import Article, Category, Tag
from accounts.models import Role

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test articles for development and testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of articles to create (default: 5)'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Get or create admin user as author
        admin_role, _ = Role.objects.get_or_create(
            name=Role.ADMIN,
            defaults={
                'display_name': 'Администратор',
                'description': 'Полный доступ'
            }
        )
        
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
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        
        # Create categories
        categories_data = [
            {'name': 'Технологии', 'description': 'Новости из мира технологий и IT'},
            {'name': 'Политика', 'description': 'Политические новости и события'},
            {'name': 'Спорт', 'description': 'Спортивные новости и результаты'},
            {'name': 'Наука', 'description': 'Научные открытия и исследования'},
            {'name': 'Культура', 'description': 'Культурные события и искусство'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Create tags
        tags_data = ['новости', 'важное', 'обзор', 'аналитика', 'интервью', 'репортаж']
        tags = []
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tags.append(tag)
            if created:
                self.stdout.write(f'Created tag: {tag.name}')
        
        # Sample articles data
        articles_data = [
            {
                'title': 'Искусственный интеллект меняет мир технологий',
                'content': '''
Искусственный интеллект продолжает революционизировать технологическую индустрию. 
Новые модели машинного обучения показывают впечатляющие результаты в различных областях, 
от медицины до автономного вождения.

Эксперты отмечают, что следующее десятилетие станет решающим для развития ИИ-технологий. 
Компании по всему миру инвестируют миллиарды долларов в исследования и разработки.

Основные направления развития включают:
- Обработку естественного языка
- Компьютерное зрение
- Автономные системы
- Предиктивную аналитику

Однако эксперты также предупреждают о необходимости этического регулирования и контроля 
за развитием ИИ-технологий.
                ''',
                'excerpt': 'Новые достижения в области искусственного интеллекта открывают невероятные возможности для будущего технологий.',
                'category_index': 0,
                'tag_indices': [0, 2, 3],
            },
            {
                'title': 'Новые открытия в области квантовой физики',
                'content': '''
Ученые сделали прорыв в понимании квантовых явлений. Новое исследование может изменить 
наше представление о природе реальности.

Международная группа физиков опубликовала результаты многолетних экспериментов, 
которые подтверждают существование ранее теоретических квантовых эффектов.

Это открытие может привести к:
- Созданию квантовых компьютеров нового поколения
- Развитию квантовой криптографии
- Новым методам передачи информации
- Революции в материаловедении

Практическое применение этих открытий ожидается в ближайшие 5-10 лет.
                ''',
                'excerpt': 'Революционное открытие в квантовой физике открывает путь к технологиям будущего.',
                'category_index': 3,
                'tag_indices': [0, 3],
            },
            {
                'title': 'Чемпионат мира по футболу: итоги и перспективы',
                'content': '''
Завершился очередной чемпионат мира по футболу, который подарил болельщикам множество 
незабываемых моментов и сюрпризов.

Турнир показал высокий уровень подготовки команд и продемонстрировал новые тактические 
подходы в современном футболе.

Ключевые моменты турнира:
- Неожиданные результаты в групповом этапе
- Яркие индивидуальные выступления
- Тактические новшества тренеров
- Рекорды посещаемости

Эксперты уже начали анализировать результаты и делать прогнозы на следующий турнир.
                ''',
                'excerpt': 'Чемпионат мира завершился триумфом и оставил яркие впечатления у миллионов болельщиков.',
                'category_index': 2,
                'tag_indices': [0, 2, 5],
            },
            {
                'title': 'Экологические инициативы набирают обороты',
                'content': '''
Правительства и корпорации по всему миру усиливают усилия по борьбе с изменением климата 
и защите окружающей среды.

Новые экологические программы включают:
- Переход на возобновляемые источники энергии
- Сокращение выбросов углекислого газа
- Защиту биоразнообразия
- Развитие циркулярной экономики

Международные эксперты отмечают, что эти меры критически важны для будущего планеты. 
Многие страны уже показывают значительный прогресс в достижении климатических целей.

Общественные организации призывают к еще более активным действиям и вовлечению граждан 
в экологические инициативы.
                ''',
                'excerpt': 'Мировое сообщество активизирует усилия по защите окружающей среды и борьбе с изменением климата.',
                'category_index': 3,
                'tag_indices': [0, 1, 3],
            },
            {
                'title': 'Культурный фестиваль объединил тысячи участников',
                'content': '''
В столице прошел масштабный культурный фестиваль, собравший артистов и зрителей 
со всего мира.

Программа фестиваля включала:
- Театральные постановки
- Музыкальные концерты
- Выставки современного искусства
- Мастер-классы и воркшопы
- Кинопоказы

Организаторы отмечают рекордную посещаемость и высокий интерес публики к культурным 
событиям. Фестиваль стал платформой для обмена опытом и культурного диалога.

Многие участники выразили надежду, что такие мероприятия станут регулярными и помогут 
развитию культурной жизни города.
                ''',
                'excerpt': 'Международный культурный фестиваль стал ярким событием сезона и собрал тысячи участников.',
                'category_index': 4,
                'tag_indices': [0, 5],
            },
        ]
        
        created_count = 0
        for i in range(min(count, len(articles_data))):
            article_data = articles_data[i]
            
            # Check if article already exists
            if Article.objects.filter(title=article_data['title']).exists():
                self.stdout.write(
                    self.style.WARNING(f'Article "{article_data["title"]}" already exists, skipping...')
                )
                continue
            
            # Create article
            article = Article.objects.create(
                title=article_data['title'],
                content=article_data['content'].strip(),
                excerpt=article_data['excerpt'],
                author=author,
                category=categories[article_data['category_index']],
                status='published',
                published_at=timezone.now(),
                views=0
            )
            
            # Add tags
            for tag_index in article_data['tag_indices']:
                article.tags.add(tags[tag_index])
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created article: {article.title}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} test articles!'
            )
        )
