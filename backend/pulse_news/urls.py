from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# API URL Configuration
api_patterns = [
    # Accounts app API endpoints (authentication, users, roles)
    path('', include('accounts.urls')),
    
    # News app API endpoints (articles, categories, tags, etc.)
    path('', include('news.urls')),
    
    # JWT Token verification
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include(api_patterns)),
    
    # DRF Browsable API auth (for testing)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
