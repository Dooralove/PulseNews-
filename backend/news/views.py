from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend

from .models import Article, Category, Tag, Comment, Reaction, Bookmark
from .serializers import (
    ArticleListSerializer, ArticleDetailSerializer, ArticleCreateUpdateSerializer,
    CategorySerializer, TagSerializer, CommentSerializer,
    ReactionSerializer, BookmarkSerializer, UserSerializer
)
from django.contrib.auth import get_user_model
from accounts.permissions import (
    CanManageArticles, CanManageComments, CanRateArticles,
    IsAdmin, CanModerateContent
)
from accounts.utils import log_user_activity

User = get_user_model()

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors to edit their own articles.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the author or admin
        return obj.author == request.user or request.user.is_staff

class ArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows articles to be viewed or edited.
    """
    queryset = Article.objects.all().order_by('-published_at', '-created_at')
    permission_classes = [CanManageArticles]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['title', 'content', 'excerpt']
    filterset_fields = {
        'category__slug': ['exact'],
        'tags__slug': ['exact'],
        'published_at': ['date__gte', 'date__lte', 'exact', 'gt', 'lt'],
        'author__username': ['exact'],
        'status': ['exact'],
    }
    ordering_fields = ['published_at', 'views', 'created_at', 'updated_at']
    ordering = ['-published_at', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        elif self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleCreateUpdateSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by multiple tags (comma-separated)
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            if tag_list:
                queryset = queryset.filter(tags__slug__in=tag_list).distinct()
        
        # Full-text search with ranking
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(excerpt__icontains=search)
            ).distinct()
        
        # For staff users, include all articles (including drafts)
        if self.request.user.is_staff:
            return queryset
            
        # For authenticated users, show published articles + their own drafts
        if self.request.user.is_authenticated:
            return queryset.filter(
                Q(status='published') | 
                Q(author=self.request.user)
            ).distinct()
            
        # For unauthenticated users, only show published articles
        return queryset.filter(status='published')
    
    def perform_create(self, serializer):
        # Set the author to the current user
        article = serializer.save(author=self.request.user)
        
        # Log article creation activity
        log_user_activity(self.request.user, 'article_create', self.request, {
            'article_id': article.id,
            'article_title': article.title
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def publish(self, request, pk=None):
        """Custom action to publish an article."""
        article = self.get_object()
        if article.author != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You don't have permission to publish this article."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        article.status = 'published'
        article.save()
        
        # Log article update activity
        log_user_activity(request.user, 'article_update', request, {
            'article_id': article.id,
            'article_title': article.title,
            'action': 'published'
        })
        
        return Response({'status': 'article published'})


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed or edited.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    lookup_field = 'slug'
    
    def get_permissions(self):
        """
        Only allow admin users to create/update/delete categories.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdmin]
        return super().get_permissions()


class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    lookup_field = 'slug'
    
    def get_permissions(self):
        """
        Only allow admin users to create/update/delete tags.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdmin]
        return super().get_permissions()


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows comments to be viewed or edited.
    """
    serializer_class = CommentSerializer
    permission_classes = [CanManageComments]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['created_at', 'updated_at']
    filterset_fields = ['article', 'parent', 'is_active']
    
    def get_queryset(self):
        queryset = Comment.objects.all()
        
        # For non-moderators, only show active comments
        if not (self.request.user.is_authenticated and self.request.user.can_moderate_content()):
            queryset = queryset.filter(is_active=True)
            
        # For article detail, show all comments (including replies)
        if 'article' in self.request.query_params:
            return queryset.filter(article_id=self.request.query_params['article'])
            
        # For list view, only show top-level comments
        return queryset.filter(parent__isnull=True)
    
    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        
        # Log comment creation activity
        log_user_activity(self.request.user, 'comment_create', self.request, {
            'comment_id': comment.id,
            'article_id': comment.article.id
        })


class ReactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for article reactions (likes/dislikes).
    """
    serializer_class = ReactionSerializer
    permission_classes = [CanRateArticles]
    
    def get_queryset(self):
        return Reaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ArticleCommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for comments under a specific article (nested route).
    """
    serializer_class = CommentSerializer
    permission_classes = [CanManageComments]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        article_pk = self.kwargs.get('article_pk')
        queryset = Comment.objects.filter(article_id=article_pk)
        
        # For non-moderators, only show active comments
        if not (self.request.user.is_authenticated and self.request.user.can_moderate_content()):
            queryset = queryset.filter(is_active=True)
            
        return queryset
    
    def perform_create(self, serializer):
        article_pk = self.kwargs.get('article_pk')
        comment = serializer.save(author=self.request.user, article_id=article_pk)
        
        # Log comment creation activity
        log_user_activity(self.request.user, 'comment_create', self.request, {
            'comment_id': comment.id,
            'article_id': comment.article.id
        })


class ArticleReactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reactions under a specific article (nested route).
    """
    serializer_class = ReactionSerializer
    permission_classes = [CanRateArticles]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    
    def get_queryset(self):
        article_pk = self.kwargs.get('article_pk')
        if self.request.user.is_authenticated:
            return Reaction.objects.filter(article_id=article_pk, user=self.request.user)
        return Reaction.objects.none()
    
    def perform_create(self, serializer):
        article_pk = self.kwargs.get('article_pk')
        serializer.save(user=self.request.user, article_id=article_pk)
    
    @action(detail=False, methods=['get'])
    def my_reaction(self, request, article_pk=None):
        """Get current user's reaction for this article."""
        try:
            reaction = Reaction.objects.get(article_id=article_pk, user=request.user)
            serializer = self.get_serializer(reaction)
            return Response(serializer.data)
        except Reaction.DoesNotExist:
            return Response({'value': None}, status=status.HTTP_200_OK)


class BookmarkViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user bookmarks.
    """
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related('article')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check if an article is bookmarked by the current user."""
        article_id = request.query_params.get('article_id')
        if not article_id:
            return Response(
                {"detail": "article_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_bookmarked = Bookmark.objects.filter(
            user=request.user,
            article_id=article_id
        ).exists()
        
        return Response({"is_bookmarked": is_bookmarked})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
