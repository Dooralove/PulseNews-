# Система аутентификации и авторизации PulseNews

## Обзор

Комплексная система аутентификации и авторизации для новостного сайта PulseNews с поддержкой ролевого доступа (RBAC - Role-Based Access Control), JWT токенов и детальным логированием активности пользователей.

## Архитектура системы

### 1. Структура базы данных

#### Модель User (accounts.models.User)
Расширенная модель пользователя на основе AbstractUser Django.

**Основные поля:**
- `id` - Уникальный идентификатор
- `username` - Имя пользователя (уникальное)
- `email` - Email адрес (уникальный, обязательный)
- `password` - Хэшированный пароль (bcrypt/PBKDF2)
- `first_name` - Имя
- `last_name` - Фамилия
- `role` - ForeignKey на модель Role (роль пользователя)
- `bio` - Биография пользователя
- `avatar` - Аватар пользователя (ImageField)
- `phone` - Номер телефона
- `birth_date` - Дата рождения
- `is_verified` - Email подтвержден
- `email_notifications` - Включены email уведомления
- `last_login_ip` - IP адрес последнего входа
- `is_active` - Активен ли пользователь
- `is_staff` - Доступ к админ панели
- `is_superuser` - Суперпользователь
- `created_at` - Дата регистрации
- `updated_at` - Дата последнего обновления

**Методы:**
- `is_reader` - Проверка роли читателя
- `is_editor` - Проверка роли редактора
- `is_admin_role` - Проверка роли администратора
- `can_manage_articles()` - Может ли управлять статьями
- `can_moderate_content()` - Может ли модерировать контент
- `can_manage_users()` - Может ли управлять пользователями
- `has_role_permission(permission_codename)` - Проверка конкретного разрешения

#### Модель Role (accounts.models.Role)
Модель для управления ролями пользователей.

**Роли:**
1. **READER (Читатель)**
   - Просмотр статей без регистрации
   - После регистрации: оценки статей, комментарии

2. **EDITOR (Редактор)**
   - Все права читателя
   - Создание статей
   - Редактирование своих статей
   - Удаление своих статей

3. **ADMIN (Администратор)**
   - Все права редактора
   - Управление всеми статьями
   - Модерация комментариев
   - Удаление комментариев
   - Управление категориями и тегами
   - Просмотр активности пользователей

**Поля:**
- `name` - Название роли (reader/editor/admin)
- `display_name` - Отображаемое название
- `description` - Описание роли
- `permissions` - ManyToMany связь с Django Permission
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### Модель UserActivity (accounts.models.UserActivity)
Логирование действий пользователей для безопасности и аналитики.

**Поля:**
- `user` - ForeignKey на User
- `action` - Тип действия (login, logout, register, article_create, etc.)
- `ip_address` - IP адрес
- `user_agent` - User Agent браузера
- `details` - JSONField с дополнительными деталями
- `created_at` - Дата и время действия

**Отслеживаемые действия:**
- Вход/выход из системы
- Регистрация
- Смена пароля
- Обновление профиля
- Создание/обновление/удаление статей
- Создание/удаление комментариев

### 2. API Эндпоинты

#### Аутентификация (api/v1/auth/)

**POST /api/v1/auth/register/**
- Регистрация нового пользователя
- Доступ: Публичный
- Тело запроса:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string (optional)",
  "birth_date": "date (optional)"
}
```
- Ответ: User data + JWT tokens

**POST /api/v1/auth/login/**
- Вход в систему
- Доступ: Публичный
- Тело запроса:
```json
{
  "username": "string",
  "password": "string"
}
```
- Ответ: User data + JWT tokens + role information

**POST /api/v1/auth/logout/**
- Выход из системы (blacklist refresh token)
- Доступ: Аутентифицированные пользователи
- Тело запроса:
```json
{
  "refresh": "string"
}
```

**POST /api/v1/auth/token/refresh/**
- Обновление access token
- Доступ: Публичный (требуется refresh token)
- Тело запроса:
```json
{
  "refresh": "string"
}
```
- Ответ: New access token + user data

**GET /api/v1/auth/profile/**
- Получение профиля текущего пользователя
- Доступ: Аутентифицированные пользователи

**PATCH /api/v1/auth/profile/**
- Обновление профиля
- Доступ: Аутентифицированные пользователи
- Тело запроса: Частичные данные профиля

**POST /api/v1/auth/password/change/**
- Смена пароля
- Доступ: Аутентифицированные пользователи
- Тело запроса:
```json
{
  "old_password": "string",
  "new_password": "string",
  "new_password2": "string"
}
```

#### Управление пользователями (api/v1/users/)

**GET /api/v1/users/**
- Список пользователей
- Доступ: Аутентифицированные (админы видят всех, остальные - только активных)

**GET /api/v1/users/{username}/**
- Детальная информация о пользователе
- Доступ: Аутентифицированные пользователи

**GET /api/v1/users/me/**
- Профиль текущего пользователя
- Доступ: Аутентифицированные пользователи

**GET /api/v1/users/my_activities/**
- История активности текущего пользователя
- Доступ: Аутентифицированные пользователи

#### Роли (api/v1/roles/)

**GET /api/v1/roles/**
- Список всех ролей
- Доступ: Администраторы

**GET /api/v1/roles/public/**
- Публичная информация о ролях (для страницы регистрации)
- Доступ: Публичный

#### Активность пользователей (api/v1/activities/)

**GET /api/v1/activities/**
- Список активностей
- Доступ: Админы видят все, пользователи - только свои

#### Статьи (api/v1/articles/)

**GET /api/v1/articles/**
- Список опубликованных статей
- Доступ: Публичный
- Фильтры: category, tags, author, date range
- Поиск: по заголовку, содержанию, описанию

**POST /api/v1/articles/**
- Создание новой статьи
- Доступ: Редакторы и администраторы
- Логирование: article_create

**GET /api/v1/articles/{id}/**
- Детальная информация о статье
- Доступ: Публичный (для опубликованных), автор (для черновиков)

**PUT/PATCH /api/v1/articles/{id}/**
- Обновление статьи
- Доступ: Автор статьи или администратор
- Логирование: article_update

**DELETE /api/v1/articles/{id}/**
- Удаление статьи
- Доступ: Автор статьи или администратор
- Логирование: article_delete

**POST /api/v1/articles/{id}/publish/**
- Публикация статьи
- Доступ: Автор статьи или администратор

#### Комментарии (api/v1/articles/{article_id}/comments/)

**GET /api/v1/articles/{article_id}/comments/**
- Список комментариев к статье
- Доступ: Публичный

**POST /api/v1/articles/{article_id}/comments/**
- Создание комментария
- Доступ: Аутентифицированные пользователи
- Логирование: comment_create

**DELETE /api/v1/articles/{article_id}/comments/{id}/**
- Удаление комментария (soft delete)
- Доступ: Автор комментария или администратор
- Логирование: comment_delete

#### Реакции (api/v1/articles/{article_id}/reactions/)

**POST /api/v1/articles/{article_id}/reactions/**
- Поставить оценку статье (лайк/дизлайк)
- Доступ: Аутентифицированные пользователи

**GET /api/v1/articles/{article_id}/reactions/**
- Получить свои реакции
- Доступ: Аутентифицированные пользователи

#### Закладки (api/v1/articles/{article_id}/bookmarks/)

**POST /api/v1/articles/{article_id}/bookmarks/**
- Добавить статью в закладки
- Доступ: Аутентифицированные пользователи

**GET /api/v1/users/me/bookmarks/**
- Список закладок пользователя
- Доступ: Аутентифицированные пользователи

#### Категории и теги

**GET /api/v1/categories/**
- Список категорий
- Доступ: Публичный

**POST/PUT/DELETE /api/v1/categories/**
- Управление категориями
- Доступ: Администраторы

**GET /api/v1/tags/**
- Список тегов
- Доступ: Публичный

**POST/PUT/DELETE /api/v1/tags/**
- Управление тегами
- Доступ: Администраторы

### 3. Система разрешений (Permissions)

#### Классы разрешений (accounts.permissions)

**IsReader**
- Проверяет, что пользователь имеет роль читателя или выше
- Используется для действий, требующих регистрации

**IsEditor**
- Проверяет, что пользователь может управлять статьями
- Редакторы могут редактировать только свои статьи
- Администраторы могут редактировать любые статьи

**IsAdmin**
- Проверяет, что пользователь имеет роль администратора
- Полный доступ ко всем операциям

**CanModerateContent**
- Проверяет право на модерацию контента
- Удаление комментариев, модерация статей

**CanManageArticles**
- Комплексная проверка для управления статьями
- Чтение доступно всем
- Создание/редактирование - редакторам и администраторам
- Редакторы могут редактировать только свои статьи

**CanManageComments**
- Управление комментариями
- Создание - аутентифицированные пользователи
- Удаление - автор или администратор

**CanRateArticles**
- Оценка статей
- Только аутентифицированные пользователи

**IsOwnerOrReadOnly**
- Чтение доступно всем
- Изменение только владельцу объекта

**IsOwnerOrAdmin**
- Доступ владельцу или администратору

### 4. Безопасность

#### Хэширование паролей
- Django использует PBKDF2 с SHA256 по умолчанию
- Настроено в `AUTH_PASSWORD_VALIDATORS`:
  - UserAttributeSimilarityValidator
  - MinimumLengthValidator
  - CommonPasswordValidator
  - NumericPasswordValidator

#### JWT Токены
**Настройки (SIMPLE_JWT):**
- Access token lifetime: 60 минут
- Refresh token lifetime: 7 дней
- Rotate refresh tokens: Да
- Blacklist after rotation: Да
- Algorithm: HS256

**Безопасность токенов:**
- Токены подписываются SECRET_KEY
- Refresh токены добавляются в blacklist при выходе
- Автоматическая ротация refresh токенов

#### CSRF Protection
- Django CSRF middleware включен
- CORS настроен для фронтенда (localhost:3000)
- Защита от clickjacking (XFrameOptionsMiddleware)

#### Валидация данных
- Все входные данные валидируются через DRF serializers
- Email проверяется на уникальность
- Username проверяется на уникальность
- Пароли валидируются Django password validators

#### Логирование активности
- Все критические действия логируются
- Сохраняется IP адрес и User Agent
- Детали действий в JSON формате
- История доступна администраторам

### 5. Технологический стек

**Backend Framework:**
- Django 4.2+
- Django REST Framework

**Аутентификация:**
- djangorestframework-simplejwt
- djangorestframework-simplejwt.token_blacklist

**База данных:**
- PostgreSQL (production)
- Поддержка SQLite (development)

**Дополнительные библиотеки:**
- django-cors-headers (CORS)
- django-filter (фильтрация)
- drf-nested-routers (вложенные маршруты)

### 6. Матрица прав доступа

| Действие | Неавторизованный | Читатель | Редактор | Администратор |
|----------|------------------|----------|----------|---------------|
| Просмотр статей | ✅ | ✅ | ✅ | ✅ |
| Просмотр комментариев | ✅ | ✅ | ✅ | ✅ |
| Регистрация | ✅ | - | - | - |
| Вход/Выход | ✅ | ✅ | ✅ | ✅ |
| Оценка статей | ❌ | ✅ | ✅ | ✅ |
| Комментирование | ❌ | ✅ | ✅ | ✅ |
| Создание статей | ❌ | ❌ | ✅ | ✅ |
| Редактирование своих статей | ❌ | ❌ | ✅ | ✅ |
| Редактирование чужих статей | ❌ | ❌ | ❌ | ✅ |
| Удаление своих статей | ❌ | ❌ | ✅ | ✅ |
| Удаление чужих статей | ❌ | ❌ | ❌ | ✅ |
| Удаление своих комментариев | ❌ | ✅ | ✅ | ✅ |
| Удаление чужих комментариев | ❌ | ❌ | ❌ | ✅ |
| Управление категориями | ❌ | ❌ | ❌ | ✅ |
| Управление тегами | ❌ | ❌ | ❌ | ✅ |
| Просмотр всех пользователей | ❌ | ❌ | ❌ | ✅ |
| Просмотр активности | ❌ | Своей | Своей | Всех |

### 7. Примеры использования API

#### Регистрация
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

#### Вход
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

#### Получение статей (с токеном)
```bash
curl -X GET http://localhost:8000/api/v1/articles/ \
  -H "Authorization: Bearer <access_token>"
```

#### Создание статьи (редактор)
```bash
curl -X POST http://localhost:8000/api/v1/articles/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новая статья",
    "content": "Содержание статьи...",
    "excerpt": "Краткое описание",
    "category": 1,
    "tags": [1, 2],
    "status": "draft"
  }'
```

#### Создание комментария
```bash
curl -X POST http://localhost:8000/api/v1/articles/1/comments/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Отличная статья!",
    "article": 1
  }'
```

### 8. Инструкции по развертыванию

#### Шаг 1: Установка зависимостей
```bash
pip install -r requirements.txt
```

#### Шаг 2: Настройка переменных окружения
Создайте файл `.env`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_DB=pulsenews
POSTGRES_USER=pulsenews
POSTGRES_PASSWORD=your-password
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Шаг 3: Миграции базы данных
```bash
python manage.py makemigrations accounts
python manage.py makemigrations news
python manage.py migrate
```

#### Шаг 4: Инициализация ролей
```bash
python manage.py init_roles
```

#### Шаг 5: Создание суперпользователя
```bash
python manage.py createsuperuser
```

#### Шаг 6: Запуск сервера
```bash
python manage.py runserver
```

### 9. Расширяемость системы

#### Добавление новой роли
1. Добавить константу в `Role.ROLE_CHOICES`
2. Создать миграцию
3. Обновить команду `init_roles`
4. Добавить проверки в методы User модели
5. Создать permission класс при необходимости

#### Добавление нового типа активности
1. Добавить в `UserActivity.ACTION_CHOICES`
2. Использовать `log_user_activity()` в нужных местах

#### Добавление нового разрешения
1. Создать класс в `accounts.permissions`
2. Наследоваться от `permissions.BasePermission`
3. Реализовать `has_permission()` и/или `has_object_permission()`
4. Использовать в ViewSet через `permission_classes`

### 10. Тестирование

#### Тестирование аутентификации
```python
from rest_framework.test import APITestCase
from accounts.models import User, Role

class AuthenticationTests(APITestCase):
    def test_user_registration(self):
        response = self.client.post('/api/v1/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('access', response.data)
```

### 11. Мониторинг и логирование

**Логи активности:**
- Доступны через Django admin
- API endpoint для просмотра своей активности
- Администраторы видят всю активность

**Метрики для мониторинга:**
- Количество регистраций
- Количество входов
- Активность по созданию контента
- Попытки несанкционированного доступа

### 12. Best Practices

1. **Всегда используйте HTTPS в production**
2. **Регулярно ротируйте SECRET_KEY**
3. **Настройте rate limiting для API**
4. **Используйте strong passwords policy**
5. **Регулярно обновляйте зависимости**
6. **Мониторьте подозрительную активность**
7. **Делайте регулярные бэкапы базы данных**
8. **Используйте environment variables для секретов**

### 13. Troubleshooting

**Проблема: Токен не работает**
- Проверьте, что токен не истек
- Убедитесь, что используете правильный формат: `Bearer <token>`
- Проверьте, что токен не в blacklist

**Проблема: Нет доступа к эндпоинту**
- Проверьте роль пользователя
- Убедитесь, что пользователь аутентифицирован
- Проверьте permission classes ViewSet

**Проблема: Ошибка при создании статьи**
- Убедитесь, что пользователь имеет роль Editor или Admin
- Проверьте, что все обязательные поля заполнены

## Контакты и поддержка

Для вопросов и предложений обращайтесь к команде разработки PulseNews.
