from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Article, Category, Tag, Comment, Reaction, Bookmark

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    can_manage_articles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'can_manage_articles']
        read_only_fields = ['id', 'can_manage_articles']
    
    def get_can_manage_articles(self, obj):
        return obj.can_manage_articles()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def create(self, validated_data):
        # Only allow staff users to create categories
        if not self.context['request'].user.is_staff:
            raise serializers.ValidationError({"detail": "You don't have permission to create categories."})
        return super().create(validated_data)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all(), required=False)
    
    class Meta:
        model = Comment
        fields = ['id', 'article', 'author', 'content', 'parent', 'replies', 
                 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['author', 'created_at', 'updated_at', 'is_active', 'replies']
    
    def get_replies(self, obj):
        # Recursively get all replies
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_active=True), many=True).data
        return []
    
    def create(self, validated_data):
        # Set the author to the current user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class ArticleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for article lists"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    reaction_summary = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'excerpt', 'cover_image', 'author', 
                 'category', 'tags', 'status', 'created_at', 'published_at', 'views', 'comment_count',
                 'reaction_summary', 'likes_count', 'dislikes_count']
        read_only_fields = ['slug', 'views']
    
    def get_comment_count(self, obj):
        return obj.comments.filter(is_active=True).count()
    
    def get_reaction_summary(self, obj):
        return {
            'likes': obj.reactions.filter(value=1).count(),
            'dislikes': obj.reactions.filter(value=-1).count()
        }
    
    def get_likes_count(self, obj):
        return obj.reactions.filter(value=1).count()
    
    def get_dislikes_count(self, obj):
        return obj.reactions.filter(value=-1).count()

class ArticleDetailSerializer(ArticleListSerializer):
    """Detailed serializer for single article view"""
    content = serializers.SerializerMethodField()
    
    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ['content', 'status', 'source_url']
        read_only_fields = ArticleListSerializer.Meta.read_only_fields + ['status']
    
    def get_content(self, obj):
        # In a real app, you might want to process the content here
        # (e.g., render markdown, handle media, etc.)
        return obj.content
    
    def to_representation(self, instance):
        # Increment view count when article is retrieved
        if self.context.get('request').method == 'GET':
            instance.views += 1
            instance.save(update_fields=['views'])
        return super().to_representation(instance)

class ArticleCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating articles"""
    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        required=False
    )
    
    class Meta:
        model = Article
        fields = ['title', 'content', 'excerpt', 'cover_image', 'category', 'tags', 'status']
    
    def validate(self, data):
        # Set the author to the current user if not set
        if not self.instance:  # Only on create
            data['author'] = self.context['request'].user
            
            # Only allow users who can manage articles to create them
            if not data['author'].can_manage_articles():
                raise serializers.ValidationError(
                    "Only editors and admins can create articles. Please contact the administrator."
                )
        
        # Validate that the category exists
        if 'category' in data and data['category']:
            # Check if category has is_active field, otherwise skip validation
            if hasattr(data['category'], 'is_active') and data['category'].is_active is False:
                raise serializers.ValidationError({"category": "This category is not active."})
            
        return data
    
    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        article = Article.objects.create(**validated_data)
        article.tags.set(tags)
        return article
    
    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        
        # Only allow the author or admin to update
        if self.context['request'].user != instance.author and not self.context['request'].user.is_staff:
            raise serializers.ValidationError(
                "You don't have permission to edit this article."
            )
        
        # Update tags if provided
        if tags is not None:
            instance.tags.set(tags)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ReactionSerializer(serializers.ModelSerializer):
    """Serializer for article reactions"""
    user = UserSerializer(read_only=True)
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all(), required=False)
    
    class Meta:
        model = Reaction
        fields = ['id', 'user', 'article', 'value', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def validate(self, data):
        # Ensure the value is either 1 (like) or -1 (dislike)
        if 'value' in data and data['value'] not in [1, -1]:
            raise serializers.ValidationError({"value": "Reaction value must be 1 (like) or -1 (dislike)."})
        return data
    
    def create(self, validated_data):
        # Ensure one reaction per user per article
        user = self.context['request'].user
        article = validated_data.get('article')
        value = validated_data.get('value')
        
        if not article:
            raise serializers.ValidationError({"article": "Article is required."})
        
        reaction, created = Reaction.objects.update_or_create(
            user=user,
            article=article,
            defaults={'value': value}
        )
        return reaction

class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for user bookmarks"""
    article = ArticleListSerializer(read_only=True)
    article_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Bookmark
        fields = ['id', 'article', 'article_id', 'created_at']
        read_only_fields = ['user', 'created_at', 'article']
    
    def create(self, validated_data):
        # Set the user to the current user
        user = self.context['request'].user
        article_id = validated_data.pop('article_id')
        
        # Check if the bookmark already exists
        bookmark, created = Bookmark.objects.get_or_create(
            user=user,
            article_id=article_id,
            defaults={'user': user, 'article_id': article_id}
        )
        
        if not created:
            # If bookmark exists, delete it (toggle behavior)
            bookmark.delete()
            raise serializers.ValidationError({"detail": "Bookmark removed"})
            
        return bookmark
