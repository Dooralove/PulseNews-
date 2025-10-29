from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from accounts.models import Role
from news.models import Article, Comment


class Command(BaseCommand):
    help = 'Initialize default roles with permissions'

    def handle(self, *args, **options):
        self.stdout.write('Initializing roles...')
        
        # Get content types
        article_ct = ContentType.objects.get_for_model(Article)
        comment_ct = ContentType.objects.get_for_model(Comment)
        
        # Create or update Reader role
        reader_role, created = Role.objects.get_or_create(
            name=Role.READER,
            defaults={
                'display_name': 'Читатель',
                'description': 'Может просматривать статьи, ставить оценки и оставлять комментарии после регистрации'
            }
        )
        
        if created:
            # Add permissions for readers
            reader_permissions = Permission.objects.filter(
                content_type=comment_ct,
                codename__in=['add_comment', 'view_comment']
            )
            reader_role.permissions.set(reader_permissions)
            self.stdout.write(self.style.SUCCESS(f'Created Reader role'))
        else:
            self.stdout.write(self.style.WARNING(f'Reader role already exists'))
        
        # Create or update Editor role
        editor_role, created = Role.objects.get_or_create(
            name=Role.EDITOR,
            defaults={
                'display_name': 'Редактор',
                'description': 'Может создавать, редактировать и удалять свои статьи'
            }
        )
        
        if created:
            # Add permissions for editors (includes reader permissions)
            editor_permissions = Permission.objects.filter(
                content_type__in=[article_ct, comment_ct],
                codename__in=[
                    'add_article', 'change_article', 'delete_article', 'view_article',
                    'add_comment', 'change_comment', 'delete_comment', 'view_comment'
                ]
            )
            editor_role.permissions.set(editor_permissions)
            self.stdout.write(self.style.SUCCESS(f'Created Editor role'))
        else:
            self.stdout.write(self.style.WARNING(f'Editor role already exists'))
        
        # Create or update Admin role
        admin_role, created = Role.objects.get_or_create(
            name=Role.ADMIN,
            defaults={
                'display_name': 'Администратор',
                'description': 'Полный доступ к управлению контентом, модерации и управлению пользователями'
            }
        )
        
        if created:
            # Add all permissions for admins
            all_permissions = Permission.objects.filter(
                content_type__in=[article_ct, comment_ct]
            )
            admin_role.permissions.set(all_permissions)
            self.stdout.write(self.style.SUCCESS(f'Created Admin role'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin role already exists'))
        
        self.stdout.write(self.style.SUCCESS('Successfully initialized all roles!'))
