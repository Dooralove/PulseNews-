from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, UserActivity


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model."""
    
    class Meta:
        model = Role
        fields = ['id', 'name', 'display_name', 'description']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates passwords and creates new users with reader role by default.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Подтверждение пароля'
    )
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role', 'phone', 'birth_date'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        """Validate that the email is unique."""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value.lower()

    def validate_username(self, value):
        """Validate that the username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def validate_password(self, value):
        """Validate password using Django's password validators."""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        """Validate that the two passwords match."""
        if data['password'] != data.get('password2'):
            raise serializers.ValidationError({
                "password2": "Пароли не совпадают."
            })
        return data

    def create(self, validated_data):
        """Create and return a new user with reader role by default."""
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        
        # Assign reader role by default if no role specified
        if 'role' not in validated_data or validated_data['role'] is None:
            reader_role, _ = Role.objects.get_or_create(
                name=Role.READER,
                defaults={
                    'display_name': 'Читатель',
                    'description': 'Может просматривать статьи, ставить оценки и оставлять комментарии'
                }
            )
            validated_data['role'] = reader_role
        
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    Includes role information and computed properties.
    """
    role = RoleSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    can_manage_articles = serializers.SerializerMethodField()
    can_moderate_content = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'bio', 'avatar', 'avatar_url',
            'phone', 'birth_date', 'is_verified', 'email_notifications',
            'date_joined', 'created_at', 'can_manage_articles', 'can_moderate_content'
        ]
        read_only_fields = [
            'id', 'username', 'role', 'is_verified',
            'date_joined', 'created_at', 'can_manage_articles', 'can_moderate_content'
        ]
    
    def get_avatar_url(self, obj):
        """Get full URL for avatar image."""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_can_manage_articles(self, obj):
        """Check if user can manage articles."""
        return obj.can_manage_articles()
    
    def get_can_moderate_content(self, obj):
        """Check if user can moderate content."""
        return obj.can_moderate_content()


class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for user lists."""
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'role', 'avatar']
        read_only_fields = fields


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token obtain pair serializer.
    Includes user data and role information in the response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to the response
        data.update({
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'full_name': self.user.full_name,
                'role': {
                    'name': self.user.role.name if self.user.role else None,
                    'display_name': self.user.role.display_name if self.user.role else None,
                },
                'is_staff': self.user.is_staff,
                'is_superuser': self.user.is_superuser,
                'can_manage_articles': self.user.can_manage_articles(),
                'can_moderate_content': self.user.can_moderate_content(),
            }
        })
        return data


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        label='Подтверждение нового пароля'
    )
    
    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Неверный текущий пароль.")
        return value
    
    def validate_new_password(self, value):
        """Validate new password using Django's password validators."""
        try:
            validate_password(value, user=self.context['request'].user)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, data):
        """Validate that the two new passwords match."""
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({
                "new_password2": "Новые пароли не совпадают."
            })
        return data
    
    def save(self):
        """Change user's password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for UserActivity model."""
    user = UserListSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'action', 'action_display',
            'ip_address', 'user_agent', 'details', 'created_at'
        ]
        read_only_fields = fields
