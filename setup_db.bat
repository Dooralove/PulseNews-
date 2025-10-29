@echo off
echo ========================================
echo Setting up database and creating test data
echo ========================================

echo.
echo Step 1: Creating migrations...
docker-compose exec backend python manage.py makemigrations

echo.
echo Step 2: Applying migrations...
docker-compose exec backend python manage.py migrate

echo.
echo Step 3: Initializing roles...
docker-compose exec backend python manage.py init_roles

echo.
echo Step 4: Creating admin user...
docker-compose exec backend python manage.py create_admin

echo.
echo Step 5: Creating test articles...
docker-compose exec backend python check_and_create_articles.py

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Admin credentials:
echo Username: admin
echo Password: admin123
echo.
pause
