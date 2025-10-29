# Исправление ошибки "Not Found: /api/v1/accounts/roles/"

## Проблема
В логах сервера появляется ошибка:
```
Not Found: /api/v1/accounts/roles/
```

## Причина
Запрос идёт на несуществующий URL `/api/v1/accounts/roles/`, в то время как правильный путь - `/api/v1/roles/`.

## Текущая структура URL

### Правильные пути:
- ✅ `/api/v1/roles/` - список ролей
- ✅ `/api/v1/roles/public/` - публичные роли для регистрации
- ✅ `/api/v1/users/` - список пользователей
- ✅ `/api/v1/auth/register/` - регистрация
- ✅ `/api/v1/auth/login/` - вход

### Неправильные пути:
- ❌ `/api/v1/accounts/roles/` - НЕ существует
- ❌ `/api/v1/accounts/users/` - НЕ существует

## Анализ

### Backend (accounts/urls.py)
```python
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'roles', views.RoleViewSet, basename='role')
```

Роутер регистрирует `roles` и `users` БЕЗ префикса `accounts/`.

### Backend (pulse_news/urls.py)
```python
api_patterns = [
    path('', include('accounts.urls')),  # Подключается БЕЗ префикса
    path('', include('news.urls')),
]

urlpatterns = [
    path('api/v1/', include(api_patterns)),
]
```

Accounts URLs подключаются напрямую к `/api/v1/`, поэтому роли доступны по пути `/api/v1/roles/`.

### Frontend (roleService.ts)
```typescript
async getRoles(): Promise<Role[]> {
  // Return hardcoded roles for reliability
  return [
    { id: 2, name: 'reader', display_name: 'Читатель', ... },
    { id: 3, name: 'editor', display_name: 'Редактор', ... }
  ];
}
```

Frontend НЕ делает запросов к API для получения ролей - использует хардкод.

## Возможные источники ошибки

### 1. Кеш браузера
Браузер может пытаться загрузить роли из старого кода, который был изменён.

**Решение:**
- Очистите кеш браузера (Ctrl+Shift+Delete)
- Откройте DevTools (F12) → Network → Disable cache
- Перезагрузите страницу с Ctrl+F5

### 2. Service Worker
Если используется Service Worker, он может кешировать старые запросы.

**Решение:**
- DevTools → Application → Service Workers → Unregister
- Перезагрузите страницу

### 3. Старый код в другом месте
Возможно, есть другой компонент, который пытается загрузить роли.

**Проверка:**
```bash
# Поиск в frontend
grep -r "accounts/roles" frontend/src/
grep -r "/roles" frontend/src/
```

### 4. Прямой запрос из браузера
Возможно, вы вручную открывали URL в браузере.

**Решение:**
- Игнорируйте эту ошибку, если она не влияет на работу приложения

## Проверка работоспособности

### Тест 1: Проверка доступности эндпоинта
```powershell
# Правильный путь - должен работать
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/roles/" -Method Get

# Неправильный путь - вернёт 404
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/accounts/roles/" -Method Get
```

### Тест 2: Проверка регистрации
1. Откройте http://localhost:3000/register
2. Проверьте, что типы аккаунтов отображаются (Читатель/Редактор)
3. Заполните форму и зарегистрируйтесь
4. Проверьте, что регистрация работает

### Тест 3: Проверка Network в DevTools
1. Откройте DevTools (F12) → Network
2. Перезагрузите страницу регистрации
3. Проверьте, есть ли запросы к `/accounts/roles/`
4. Если есть - найдите, откуда они идут

## Если ошибка продолжается

### Вариант 1: Добавить алиас URL (не рекомендуется)
```python
# backend/pulse_news/urls.py
from django.views.generic import RedirectView

api_patterns = [
    # Redirect old URL to new one
    path('accounts/roles/', RedirectView.as_view(url='/api/v1/roles/', permanent=True)),
    
    path('', include('accounts.urls')),
    path('', include('news.urls')),
]
```

### Вариант 2: Изменить структуру URL (сломает другие эндпоинты)
```python
# backend/pulse_news/urls.py
api_patterns = [
    path('accounts/', include('accounts.urls')),  # Добавить префикс
    path('', include('news.urls')),
]
```
**Внимание:** Это сломает auth эндпоинты! Они станут `/api/v1/accounts/auth/register/` вместо `/api/v1/auth/register/`.

### Вариант 3: Разделить accounts URLs
```python
# backend/accounts/urls.py
# Создать два набора URL - для auth и для остального

auth_patterns = [...]
resource_patterns = [...]

urlpatterns = [
    path('auth/', include(auth_patterns)),
    path('accounts/', include(resource_patterns)),
]
```

## Рекомендация

**Игнорируйте эту ошибку**, если:
1. Регистрация работает корректно
2. Роли отображаются на странице регистрации
3. Ошибка не влияет на функциональность

Это, скорее всего, старый запрос из кеша браузера или DevTools. Просто очистите кеш браузера.

## Проверка всех эндпоинтов

Запустите тестовый скрипт:
```powershell
.\test_endpoints.ps1
```

Он проверит доступность всех основных эндпоинтов и покажет, какие работают, а какие нет.
