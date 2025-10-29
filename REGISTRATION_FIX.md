# Исправление регистрации пользователей

## Проблема
При нажатии на кнопку "Зарегистрироваться" ничего не происходило.

## Причина
В файле `backend/news/auth_views.py` использовался неправильный импорт сериализатора. Импортировался `UserRegistrationSerializer` из `news.authentication`, который не поддерживал поле `role`, в то время как фронтенд отправлял данные с полем `role`.

## Исправления

### 1. `backend/news/auth_views.py`
**Изменено**: Импорт сериализаторов
```python
# Было:
from .authentication import (
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
)

# Стало:
from accounts.serializers import (
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
)
```

**Причина**: Сериализатор из `accounts.serializers` поддерживает:
- Поле `role` для выбора типа аккаунта (Читатель/Редактор)
- Поле `phone` для номера телефона
- Поле `birth_date` для даты рождения
- Автоматическое назначение роли "Читатель" по умолчанию
- Валидацию паролей с использованием Django password validators
- Русские сообщения об ошибках

### 2. `backend/accounts/serializers.py`
**Добавлено**: Методы в `UserProfileSerializer`
```python
can_manage_articles = serializers.SerializerMethodField()
can_moderate_content = serializers.SerializerMethodField()

def get_can_manage_articles(self, obj):
    return obj.can_manage_articles()

def get_can_moderate_content(self, obj):
    return obj.can_moderate_content()
```

**Причина**: Фронтенд ожидает эти поля для определения прав пользователя.

## Структура данных регистрации

### Запрос (Frontend → Backend)
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!",
  "first_name": "Иван",
  "last_name": "Иванов",
  "role": 2,
  "phone": "+79001234567"
}
```

### Ответ (Backend → Frontend)
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Иван",
    "last_name": "Иванов",
    "full_name": "Иван Иванов",
    "role": {
      "id": 2,
      "name": "reader",
      "display_name": "Читатель",
      "description": "Может просматривать статьи и оставлять комментарии"
    },
    "can_manage_articles": false,
    "can_moderate_content": false,
    "date_joined": "2025-10-30T01:00:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Роли пользователей

### ID ролей:
- `2` - Читатель (reader) - может просматривать статьи, ставить лайки, комментировать
- `3` - Редактор (editor) - может создавать и редактировать свои статьи
- `1` - Администратор (admin) - полный доступ ко всем функциям

### Права по ролям:
- **Читатель**: 
  - Просмотр статей
  - Лайки/дизлайки
  - Комментарии
  - Закладки

- **Редактор**: 
  - Все права читателя
  - Создание статей
  - Редактирование своих статей
  - Удаление своих статей

- **Администратор**: 
  - Все права редактора
  - Редактирование любых статей
  - Удаление любых статей
  - Модерация комментариев
  - Управление пользователями

## Тестирование

### Через PowerShell:
```powershell
.\test_registration.ps1
```

### Через curl:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "password2": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User",
    "role": 2
  }'
```

## Проверка работы

1. Откройте http://localhost:3000/register
2. Заполните форму регистрации:
   - Выберите тип аккаунта (Читатель или Редактор)
   - Введите имя и фамилию
   - Введите имя пользователя
   - Введите email
   - Введите пароль (минимум 8 символов)
   - Подтвердите пароль
3. Нажмите "Зарегистрироваться"
4. После успешной регистрации вы будете автоматически авторизованы и перенаправлены на главную страницу

## Возможные ошибки

### "Пользователь с таким именем уже существует"
- Выберите другое имя пользователя

### "Пользователь с таким email уже существует"
- Используйте другой email адрес

### "Пароли не совпадают"
- Убедитесь, что оба поля пароля содержат одинаковые значения

### "Пароль должен содержать минимум 8 символов"
- Используйте более длинный пароль

### "This password is too common"
- Используйте более сложный пароль (комбинация букв, цифр и символов)

## Логирование

Форма регистрации содержит подробное логирование в консоли браузера:
- Данные формы перед отправкой
- Результат валидации
- Ответ сервера
- Ошибки

Откройте DevTools (F12) → Console для просмотра логов.
