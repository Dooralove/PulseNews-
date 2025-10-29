from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Role, UserActivity
from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserListSerializer,
    PasswordChangeSerializer,
    RoleSerializer,
    UserActivitySerializer
)
from .permissions import IsAdmin
from .utils import log_user_activity, update_last_login_ip

User = get_user_model()


class UserRegistrationView(APIView):
    """
    View for user registration.
    Creates a new user with reader role by default.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Log registration activity
            log_user_activity(user, 'register', request)
            
            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Регистрация прошла успешно!'
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain pair view that uses our custom serializer.
    Includes user data and role information in the response.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user from serializer
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.user
                
                # Log login activity
                log_user_activity(user, 'login', request)
                
                # Update last login IP
                update_last_login_ip(user, request)
        
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view that includes user data in the response.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200 and 'refresh' in request.data:
            try:
                refresh = request.data['refresh']
                token = RefreshToken(refresh)
                user_id = token['user_id']
                user = User.objects.get(id=user_id)
                
                # Add user data to the response
                response.data['user'] = UserProfileSerializer(
                    user, 
                    context={'request': request}
                ).data
            except Exception:
                # If there's an error, just return the original response
                pass
                
        return response


class UserProfileView(APIView):
    """
    View for getting and updating the current user's profile.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get the current user's profile."""
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request):
        """Update the current user's profile."""
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Log profile update activity
            log_user_activity(request.user, 'profile_update', request)
            
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        """Delete the current user's account."""
        user = request.user
        
        # Log account deletion activity before deleting
        log_user_activity(user, 'account_delete', request)
        
        # Delete the user account
        user.is_active = False
        user.save()
        
        return Response(
            {'message': 'Аккаунт успешно удален.'},
            status=status.HTTP_204_NO_CONTENT
        )


class PasswordChangeView(APIView):
    """
    View for changing user password.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Log password change activity
            log_user_activity(request.user, 'password_change', request)
            
            return Response({
                'message': 'Пароль успешно изменен.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    View for logging out a user by blacklisting their refresh token.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token обязателен"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            # Log logout activity
            log_user_activity(request.user, 'logout', request)
            
            return Response(
                {"message": "Выход выполнен успешно"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": "Неверный токен"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing users.
    Only admins can view all users.
    """
    queryset = User.objects.select_related('role').all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserProfileSerializer
        return UserListSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        
        # Admins can see all users
        if self.request.user.can_manage_users():
            return queryset
        
        # Regular users can only see active users
        return queryset.filter(is_active=True)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile."""
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_activities(self, request):
        """Get current user's activity log."""
        activities = UserActivity.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]
        
        serializer = UserActivitySerializer(activities, many=True)
        return Response(serializer.data)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing roles.
    Only admins can manage roles through Django admin.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    # Provide open read-only access so registration page can fetch roles
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public(self, request):
        """Get public role information (for registration page)."""
        # Expose reader and editor roles for the registration page
        roles = Role.objects.filter(name__in=[Role.READER, Role.EDITOR])
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user activities.
    Only admins can view all activities.
    Users can view their own activities.
    """
    queryset = UserActivity.objects.select_related('user').all()
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        
        # Admins can see all activities
        if self.request.user.can_manage_users():
            return queryset
        
        # Regular users can only see their own activities
        return queryset.filter(user=self.request.user)
