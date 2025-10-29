from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .auth_views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    UserProfileView,
    LogoutView
)

# Create a router for our API endpoints
router = DefaultRouter()
router.register(r'articles', views.ArticleViewSet, basename='article')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'tags', views.TagViewSet, basename='tag')
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'bookmarks', views.BookmarkViewSet, basename='bookmark')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'reactions', views.ReactionViewSet, basename='reaction')

# Nested router for comments and reactions under articles
article_router = routers.NestedSimpleRouter(router, r'articles', lookup='article')
article_router.register(r'comments', views.ArticleCommentViewSet, basename='article-comments')
article_router.register(r'reactions', views.ArticleReactionViewSet, basename='article-reactions')

# User-specific endpoints
user_router = routers.NestedSimpleRouter(router, r'users', lookup='user')
user_router.register(r'bookmarks', views.BookmarkViewSet, basename='user-bookmarks')

# Authentication URL patterns
auth_patterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    path('', include(article_router.urls)),
    path('', include(user_router.urls)),
    
    # Authentication URLs
    path('auth/', include(auth_patterns)),
]
