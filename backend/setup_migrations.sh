#!/bin/sh
echo "Creating migrations for accounts..."
python manage.py makemigrations accounts

echo "Creating migrations for news..."
python manage.py makemigrations news

echo "Applying all migrations..."
python manage.py migrate

echo "Initializing roles..."
python manage.py init_roles

echo "Creating admin user..."
python manage.py create_admin

echo "Creating test articles..."
python check_and_create_articles.py

echo "Done!"
