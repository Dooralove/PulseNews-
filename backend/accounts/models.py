from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _


class Role(models.Model):
    """
    Role model for flexible role-based access control.
    Allows creating custom roles with specific permissions.
    """
    READER = 'reader'
    EDITOR = 'editor'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (READER, 'Читатель'),
        (EDITOR, 'Редактор'),
        (ADMIN, 'Администратор'),
    ]
    
    name = models.CharField(
        max_length=50,
        unique=True,
        choices=ROLE_CHOICES,
        verbose_name='Название роли'
    )
    display_name = models.CharField(
        max_length=100,
        verbose_name='Отображаемое название'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание'
    )
    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name='custom_roles',
        verbose_name='Права доступа'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Роль'
        verbose_name_plural = 'Роли'
        ordering = ['name']
    
    def __str__(self):
        return self.get_name_display()


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds role-based access control and additional profile fields.
    """
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("Пользователь с таким email уже существует."),
        }
    )
    
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name='Роль'
    )
    
    bio = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='О себе'
    )
    
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='Аватар'
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Телефон'
    )
    
    birth_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дата рождения'
    )
    
    is_verified = models.BooleanField(
        default=False,
        verbose_name='Email подтвержден'
    )
    
    email_notifications = models.BooleanField(
        default=True,
        verbose_name='Email уведомления'
    )
    
    last_login_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='IP последнего входа'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата регистрации'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.username
    
    @property
    def is_reader(self):
        """Check if user has reader role."""
        return self.role and self.role.name == Role.READER
    
    @property
    def is_editor(self):
        """Check if user has editor role."""
        return self.role and self.role.name == Role.EDITOR
    
    @property
    def is_admin_role(self):
        """Check if user has admin role."""
        return self.role and self.role.name == Role.ADMIN
    
    @property
    def full_name(self):
        """Return user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def has_role_permission(self, permission_codename):
        """
        Check if user has a specific permission through their role.
        
        Args:
            permission_codename: The codename of the permission to check
            
        Returns:
            bool: True if user has the permission, False otherwise
        """
        if self.is_superuser:
            return True
        
        if not self.role:
            return False
        
        return self.role.permissions.filter(codename=permission_codename).exists()
    
    def can_manage_articles(self):
        """Check if user can create, edit, and delete articles."""
        return self.is_editor or self.is_admin_role or self.is_staff or self.is_superuser
    
    def can_moderate_content(self):
        """Check if user can moderate comments and content."""
        return self.is_admin_role or self.is_staff or self.is_superuser
    
    def can_manage_users(self):
        """Check if user can manage other users."""
        return self.is_admin_role or self.is_superuser


class UserActivity(models.Model):
    """
    Model to track user activities for security and analytics.
    """
    ACTION_CHOICES = [
        ('login', 'Вход'),
        ('logout', 'Выход'),
        ('register', 'Регистрация'),
        ('password_change', 'Смена пароля'),
        ('password_reset', 'Сброс пароля'),
        ('profile_update', 'Обновление профиля'),
        ('article_create', 'Создание статьи'),
        ('article_update', 'Обновление статьи'),
        ('article_delete', 'Удаление статьи'),
        ('comment_create', 'Создание комментария'),
        ('comment_delete', 'Удаление комментария'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activities',
        verbose_name='Пользователь'
    )
    
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        verbose_name='Действие'
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='IP адрес'
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name='User Agent'
    )
    
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Детали'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата и время'
    )
    
    class Meta:
        verbose_name = 'Активность пользователя'
        verbose_name_plural = 'Активности пользователей'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} - {self.created_at}"
