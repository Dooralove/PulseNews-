from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Role, UserActivity


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin interface for Role model."""
    list_display = ['name', 'display_name', 'created_at']
    list_filter = ['name', 'created_at']
    search_fields = ['name', 'display_name', 'description']
    filter_horizontal = ['permissions']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'display_name', 'description')
        }),
        ('Права доступа', {
            'fields': ('permissions',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model."""
    list_display = ['username', 'email', 'role', 'is_verified', 'is_staff', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_staff', 'is_active', 'is_superuser', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'last_login_ip', 'date_joined']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        (_('Личная информация'), {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'birth_date', 'bio', 'avatar')
        }),
        (_('Роль и права'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')
        }),
        (_('Настройки'), {
            'fields': ('email_notifications',)
        }),
        (_('Системная информация'), {
            'fields': ('last_login', 'last_login_ip', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_staff', 'is_active'),
        }),
    )
    
    filter_horizontal = ['groups', 'user_permissions']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('role')


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin interface for UserActivity model."""
    list_display = ['user', 'action', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__username', 'user__email', 'ip_address']
    readonly_fields = ['user', 'action', 'ip_address', 'user_agent', 'details', 'created_at']
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual creation of activities."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Make activities read-only."""
        return False
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('user')
