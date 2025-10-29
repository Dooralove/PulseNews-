from .base import *

# Local development settings
DEBUG = True

# Database configuration for Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pulsenews',
        'USER': 'pulsenews',
        'PASSWORD': 'pulsenews123',
        'HOST': 'db',
        'PORT': '5432',
    }
}

# Redis configuration for Docker
CELERY_BROKER_URL = 'redis://:redispass123@redis:6379/1'
CELERY_RESULT_BACKEND = 'redis://:redispass123@redis:6379/1'

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:80",
]
