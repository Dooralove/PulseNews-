from rest_framework import permissions


class IsReader(permissions.BasePermission):
    """
    Permission class to check if user has reader role.
    Readers can view articles, rate them, and leave comments.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_reader or request.user.is_editor or 
             request.user.is_admin_role or request.user.is_staff)
        )


class IsEditor(permissions.BasePermission):
    """
    Permission class to check if user has editor role or higher.
    Editors can create, edit, and delete articles.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_manage_articles()
        )
    
    def has_object_permission(self, request, view, obj):
        # Admins and staff can edit any article
        if request.user.is_admin_role or request.user.is_staff or request.user.is_superuser:
            return True
        
        # Editors can only edit their own articles
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        return False


class IsAdmin(permissions.BasePermission):
    """
    Permission class to check if user has admin role.
    Admins can moderate content, manage users, and perform all operations.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_admin_role or request.user.is_staff or request.user.is_superuser)
        )


class CanModerateContent(permissions.BasePermission):
    """
    Permission class to check if user can moderate content.
    This includes deleting comments and moderating articles.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_moderate_content()
        )
    
    def has_object_permission(self, request, view, obj):
        return request.user.can_moderate_content()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Read permissions are allowed to any request.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to allow owners or admins to access an object.
    """
    def has_object_permission(self, request, view, obj):
        # Admins have full access
        if request.user.is_admin_role or request.user.is_staff or request.user.is_superuser:
            return True
        
        # Owners have access to their own objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        return False


class CanManageArticles(permissions.BasePermission):
    """
    Permission class for article management.
    Allows editors and admins to create/edit/delete articles.
    """
    def has_permission(self, request, view):
        # Allow read access to everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write access only for editors and admins
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_manage_articles()
        )
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admins can edit/delete any article
        if request.user.can_moderate_content():
            return True
        
        # Editors can only edit/delete their own articles
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        return False


class CanManageComments(permissions.BasePermission):
    """
    Permission class for comment management.
    Authenticated users can create comments.
    Only comment authors and admins can edit/delete comments.
    """
    def has_permission(self, request, view):
        # Allow read access to everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write access only for authenticated users
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admins can edit/delete any comment
        if request.user.can_moderate_content():
            return True
        
        # Users can only edit/delete their own comments
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        return False


class CanRateArticles(permissions.BasePermission):
    """
    Permission class for rating articles.
    Only authenticated users can rate articles.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
