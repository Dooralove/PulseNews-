# Исправление отображения комментариев

## Проблема
Комментарии создаются (POST запрос работает), но не отображаются на странице статьи.

## Внесенные изменения

### 1. Добавлено логирование в `CommentSectionNew.tsx`
- Логирование при загрузке комментариев
- Логирование количества загруженных комментариев
- Логирование при рендеринге компонента

### 2. Исправлен `ArticleCommentViewSet` в backend
Добавлен фильтр `parent__isnull=True` для возврата только комментариев верхнего уровня:
```python
queryset = Comment.objects.filter(article_id=article_pk, parent__isnull=True)
```

### 3. Создан тестовый скрипт `test_comments_simple.ps1`
Проверяет:
- Получение статей
- Получение комментариев для статьи
- Отображение информации о комментариях

## Как проверить

### Шаг 1: Запустить тестовый скрипт
```powershell
.\test_comments_simple.ps1
```

Это покажет, возвращает ли backend комментарии.

### Шаг 2: Проверить в браузере
1. Откройте страницу статьи
2. Откройте DevTools (F12) → Console
3. Обновите страницу
4. Найдите в консоли сообщения:
   ```
   CommentSectionNew: Loading comments for article X
   CommentSectionNew: Loaded comments: [...]
   CommentSectionNew: Number of comments: X
   CommentSectionNew: Rendering with X comments
   ```

### Шаг 3: Проверить Network запрос
1. В DevTools откройте вкладку Network
2. Обновите страницу
3. Найдите запрос `GET /api/v1/articles/{id}/comments/`
4. Проверьте ответ - должен быть массив комментариев

## Возможные причины проблемы

### 1. Backend не возвращает комментарии
**Проверка**: Запустите `test_comments_simple.ps1`
**Решение**: 
- Проверьте, что комментарии есть в базе данных
- Проверьте фильтры в `ArticleCommentViewSet`
- Проверьте поле `is_active` у комментариев

### 2. Frontend не загружает комментарии
**Проверка**: Смотрите в консоли "Loading comments" и "Loaded comments"
**Решение**:
- Проверьте, что `articleId` передается правильно
- Проверьте URL запроса в Network tab
- Проверьте, нет ли ошибок в консоли

### 3. Комментарии загружаются, но не рендерятся
**Проверка**: Смотрите "Number of comments" в консоли
**Решение**:
- Проверьте, что `comments.length > 0`
- Проверьте, что `loadingComments === false`
- Проверьте функцию `renderComment`

### 4. Проблема с вложенными комментариями
**Проверка**: Проверьте поле `parent` у комментариев
**Решение**:
- Убедитесь, что `parent__isnull=True` в queryset
- Проверьте, что `CommentSerializer` правильно обрабатывает `replies`

## Структура данных комментария

Комментарий должен иметь следующую структуру:
```json
{
  "id": 1,
  "article": 1,
  "author": {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "full_name": "User Name"
  },
  "content": "Текст комментария",
  "parent": null,
  "replies": [],
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z",
  "is_active": true
}
```

## Проверка базы данных

Если комментарии не возвращаются, проверьте базу данных:

```python
# В Django shell
python manage.py shell

from news.models import Comment
from django.contrib.auth import get_user_model

User = get_user_model()

# Проверить все комментарии
comments = Comment.objects.all()
print(f"Total comments: {comments.count()}")

# Проверить комментарии для конкретной статьи
article_id = 1  # Замените на ID вашей статьи
article_comments = Comment.objects.filter(article_id=article_id)
print(f"Comments for article {article_id}: {article_comments.count()}")

# Показать детали комментариев
for comment in article_comments:
    print(f"ID: {comment.id}, Author: {comment.author}, Active: {comment.is_active}, Parent: {comment.parent}")
```

## Ожидаемое поведение

1. При загрузке страницы статьи:
   - В консоли: "Loading comments for article X"
   - В консоли: "Loaded comments: [array]"
   - В консоли: "Number of comments: X"

2. Если комментарии есть:
   - Отображается заголовок "Комментарии (X)"
   - Показывается список комментариев
   - Каждый комментарий имеет автора, дату и текст

3. Если комментариев нет:
   - Отображается "Комментариев пока нет. Будьте первым!"

4. После создания нового комментария:
   - Комментарий добавляется в список
   - Счетчик обновляется
   - Поле ввода очищается

## Следующие шаги

1. Запустите `test_comments_simple.ps1` и проверьте, возвращаются ли комментарии
2. Откройте страницу статьи и проверьте консоль браузера
3. Проверьте Network tab для запроса комментариев
4. Если комментарии не возвращаются, проверьте базу данных
5. Если комментарии возвращаются, но не отображаются, проверьте рендеринг в компоненте
