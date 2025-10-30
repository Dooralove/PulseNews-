# Отладка отображения комментариев - Следующие шаги

## Текущая ситуация
✅ Backend возвращает 12 комментариев (статус 200 OK)
❌ На странице отображается "Комментариев пока нет. Будьте первым!"

## Что нужно сделать СЕЙЧАС

### 1. Откройте страницу статьи с ID 5
```
http://localhost:3000/articles/5
```

### 2. Откройте DevTools (F12)
- Перейдите на вкладку **Console**

### 3. Обновите страницу (F5)

### 4. Найдите в консоли следующие сообщения:

```
CommentSectionNew: Loading comments for article 5
CommentSectionNew: Raw response: [...]
CommentSectionNew: Is array? true/false
CommentSectionNew: Number of comments: X
CommentSectionNew: First comment: {...}
CommentSectionNew: Loading finished, loadingComments set to false
CommentSectionNew: Rendering with X comments
CommentSectionNew: Render check - loadingComments: false
CommentSectionNew: Render check - comments.length: X
CommentSectionNew: Render check - comments: [...]
```

### 5. Что искать в логах:

#### Сценарий 1: Комментарии не загружаются
Если видите:
```
CommentSectionNew: Number of comments: 0
```
**Проблема**: API не возвращает комментарии или возвращает пустой массив
**Решение**: Проверьте Network tab, посмотрите на ответ API

#### Сценарий 2: Комментарии загружаются, но не массив
Если видите:
```
CommentSectionNew: Is array? false
```
**Проблема**: API возвращает объект вместо массива
**Решение**: Нужно изменить обработку ответа в commentService

#### Сценарий 3: loadingComments не меняется
Если видите:
```
CommentSectionNew: Render check - loadingComments: true
```
**Проблема**: Состояние загрузки не сбрасывается
**Решение**: Проверьте, нет ли ошибки в try-catch

#### Сценарий 4: comments.length === 0 после загрузки
Если видите:
```
CommentSectionNew: Number of comments: 12
CommentSectionNew: Render check - comments.length: 0
```
**Проблема**: Комментарии загружаются, но не сохраняются в state
**Решение**: Проблема с setComments()

## Дополнительная проверка

### Проверьте Network tab:
1. Откройте вкладку **Network**
2. Обновите страницу
3. Найдите запрос: `GET /api/v1/articles/5/comments/`
4. Кликните на него
5. Перейдите на вкладку **Response**
6. Скопируйте ответ и проверьте структуру

### Ожидаемая структура ответа:
```json
[
  {
    "id": 1,
    "article": 5,
    "author": {
      "id": 1,
      "username": "user",
      "email": "user@example.com"
    },
    "content": "Текст комментария",
    "parent": null,
    "replies": [],
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z",
    "is_active": true
  }
]
```

## Возможные проблемы и решения

### Проблема 1: API возвращает объект с полем "results"
Если ответ выглядит так:
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [...]
}
```

**Решение**: Изменить commentService.ts:
```typescript
async getComments(articleId: number): Promise<Comment[]> {
  const response = await api.get(`/articles/${articleId}/comments/`);
  // Если ответ - объект с results
  return response.data.results || response.data;
}
```

### Проблема 2: Кодировка в консоли
Если в консоли видны кракозябры вместо русского текста - это нормально для PowerShell.
Главное - проверьте данные в браузере.

### Проблема 3: CORS ошибка
Если в консоли видите CORS error:
- Проверьте, что backend запущен
- Проверьте CORS настройки в Django

## После проверки

Скопируйте ВСЕ сообщения из консоли, начиная с "CommentSectionNew:", и отправьте мне.
Также скопируйте ответ из Network tab для запроса комментариев.

Это поможет точно определить, где проблема!
