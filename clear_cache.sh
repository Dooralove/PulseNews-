#!/bin/bash
echo "Clearing Django cache..."
docker-compose exec backend python manage.py shell -c "from django.core.cache import cache; cache.clear(); print('Cache cleared')"
echo "Restarting backend..."
docker-compose restart backend
