from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Role

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an admin user with admin role'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username for the admin user (default: admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@pulsenews.com',
            help='Email for the admin user (default: admin@pulsenews.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the admin user (default: admin123)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Admin',
            help='First name for the admin user (default: Admin)'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the admin user (default: User)'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User with username "{username}" already exists!')
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email "{email}" already exists!')
            )
            return

        # Get or create admin role
        admin_role, created = Role.objects.get_or_create(
            name=Role.ADMIN,
            defaults={
                'display_name': 'Администратор',
                'description': 'Полный доступ к управлению контентом, модерации и управлению пользователями'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('Created Admin role'))

        # Create admin user
        admin_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=admin_role,
            is_staff=True,
            is_superuser=True,
            is_active=True,
            is_verified=True
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created admin user!\n'
                f'Username: {username}\n'
                f'Email: {email}\n'
                f'Password: {password}\n'
                f'Role: {admin_role.display_name}\n'
            )
        )
