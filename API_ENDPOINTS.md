# API Endpoints Documentation

## Base URL
```
http://localhost:8000/api/v1/
```

## URL Structure

Все API эндпоинты находятся под префиксом `/api/v1/`. 

### Важно!
- Роли доступны по пути `/api/v1/roles/` (БЕЗ префикса `accounts/`)
- Пользователи доступны по пути `/api/v1/users/` (БЕЗ префикса `accounts/`)
- Аутентификация доступна по пути `/api/v1/auth/` (БЕЗ префикса `accounts/`)

## Authentication Endpoints

### Registration
```
POST /api/v1/auth/register/
```
**Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!",
  "first_name": "Test",
  "last_name": "User",
  "role": 2
}
```

### Login
```
POST /api/v1/auth/login/
```
**Body:**
```json
{
  "username": "testuser",
  "password": "SecurePassword123!"
}
```

### Logout
```
POST /api/v1/auth/logout/
```
**Headers:** `Authorization: Bearer <access_token>`
**Body:**
```json
{
  "refresh": "<refresh_token>"
}
```

### Token Refresh
```
POST /api/v1/auth/token/refresh/
```
**Body:**
```json
{
  "refresh": "<refresh_token>"
}
```

### Get Profile
```
GET /api/v1/auth/profile/
```
**Headers:** `Authorization: Bearer <access_token>`

### Update Profile
```
PATCH /api/v1/auth/profile/
```
**Headers:** `Authorization: Bearer <access_token>`

### Change Password
```
POST /api/v1/auth/password/change/
```
**Headers:** `Authorization: Bearer <access_token>`

## Roles Endpoints

### List All Roles
```
GET /api/v1/roles/
```
**Permission:** AllowAny (public access)

### Get Public Roles (for registration)
```
GET /api/v1/roles/public/
```
**Permission:** AllowAny
**Returns:** Only Reader and Editor roles

### Get Single Role
```
GET /api/v1/roles/{id}/
```

## Users Endpoints

### List Users
```
GET /api/v1/users/
```
**Headers:** `Authorization: Bearer <access_token>`

### Get User by Username
```
GET /api/v1/users/{username}/
```
**Headers:** `Authorization: Bearer <access_token>`

### Get Current User
```
GET /api/v1/users/me/
```
**Headers:** `Authorization: Bearer <access_token>`

### Get My Activities
```
GET /api/v1/users/my_activities/
```
**Headers:** `Authorization: Bearer <access_token>`

## Articles Endpoints

### List Articles
```
GET /api/v1/articles/
```
**Query params:**
- `search` - search in title, content, excerpt
- `category__slug` - filter by category
- `tags__slug` - filter by tags
- `author__username` - filter by author
- `ordering` - sort by field (e.g., `-published_at`)

### Get Article
```
GET /api/v1/articles/{id}/
```

### Create Article
```
POST /api/v1/articles/
```
**Headers:** `Authorization: Bearer <access_token>`
**Permission:** Editor or Admin

### Update Article
```
PUT/PATCH /api/v1/articles/{id}/
```
**Headers:** `Authorization: Bearer <access_token>`
**Permission:** Author or Admin

### Delete Article
```
DELETE /api/v1/articles/{id}/
```
**Headers:** `Authorization: Bearer <access_token>`
**Permission:** Author or Admin

### Publish Article
```
POST /api/v1/articles/{id}/publish/
```
**Headers:** `Authorization: Bearer <access_token>`

## Comments Endpoints

### List Comments for Article
```
GET /api/v1/articles/{article_id}/comments/
```

### Create Comment
```
POST /api/v1/articles/{article_id}/comments/
```
**Headers:** `Authorization: Bearer <access_token>`
**Body:**
```json
{
  "content": "Comment text",
  "parent": null
}
```

### Delete Comment
```
DELETE /api/v1/articles/{article_id}/comments/{comment_id}/
```
**Headers:** `Authorization: Bearer <access_token>`
**Permission:** Author or Moderator

## Reactions (Likes/Dislikes) Endpoints

### Get My Reaction for Article
```
GET /api/v1/articles/{article_id}/reactions/my_reaction/
```
**Headers:** `Authorization: Bearer <access_token>`

### Create/Update Reaction
```
POST /api/v1/articles/{article_id}/reactions/
```
**Headers:** `Authorization: Bearer <access_token>`
**Body:**
```json
{
  "value": 1
}
```
**Values:** `1` for like, `-1` for dislike

### Delete Reaction
```
DELETE /api/v1/articles/{article_id}/reactions/{reaction_id}/
```
**Headers:** `Authorization: Bearer <access_token>`

## Bookmarks Endpoints

### List My Bookmarks
```
GET /api/v1/bookmarks/
```
**Headers:** `Authorization: Bearer <access_token>`

### Check if Article is Bookmarked
```
GET /api/v1/bookmarks/check/?article_id={article_id}
```
**Headers:** `Authorization: Bearer <access_token>`

### Toggle Bookmark
```
POST /api/v1/bookmarks/
```
**Headers:** `Authorization: Bearer <access_token>`
**Body:**
```json
{
  "article_id": 1
}
```

## Categories Endpoints

### List Categories
```
GET /api/v1/categories/
```

### Get Category
```
GET /api/v1/categories/{slug}/
```

### Create Category
```
POST /api/v1/categories/
```
**Headers:** `Authorization: Bearer <access_token>`
**Permission:** Admin only

## Tags Endpoints

### List Tags
```
GET /api/v1/tags/
```

### Get Tag
```
GET /api/v1/tags/{slug}/
```

### Create Tag
```
POST /api/v1/tags/
```
**Headers:** `Authorization: Bearer <access_token>`
**Permission:** Admin only

## Common Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

## Testing

Run the test script to check endpoint availability:
```powershell
.\test_endpoints.ps1
```

## Notes

1. All authenticated endpoints require `Authorization: Bearer <access_token>` header
2. Tokens expire after a certain time (configured in settings)
3. Use `/api/v1/auth/token/refresh/` to get a new access token
4. CORS is configured to allow requests from `http://localhost:3000` in development
