from .models import UserActivity


def get_client_ip(request):
    """
    Get client IP address from request.
    Handles proxy headers like X-Forwarded-For.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Get user agent string from request."""
    return request.META.get('HTTP_USER_AGENT', '')


def log_user_activity(user, action, request=None, details=None):
    """
    Log user activity for security and analytics.
    
    Args:
        user: User instance
        action: Action type (from UserActivity.ACTION_CHOICES)
        request: HTTP request object (optional)
        details: Additional details as dict (optional)
    """
    activity_data = {
        'user': user,
        'action': action,
        'details': details or {}
    }
    
    if request:
        activity_data['ip_address'] = get_client_ip(request)
        activity_data['user_agent'] = get_user_agent(request)
    
    UserActivity.objects.create(**activity_data)


def update_last_login_ip(user, request):
    """Update user's last login IP address."""
    if request:
        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=['last_login_ip'])
