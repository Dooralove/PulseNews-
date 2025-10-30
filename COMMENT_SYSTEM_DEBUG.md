# Comment System Debugging Guide

## Issue
The "Send" button in the comment system doesn't work - nothing happens when clicked.

## Investigation Steps

### 1. Check Browser Console
Open the browser developer tools (F12) and check for:
- JavaScript errors
- Network requests failing
- 401/403 authentication errors
- CORS errors

### 2. Verify API Endpoint
The comment endpoint should be:
```
POST /api/v1/articles/{article_id}/comments/
```

### 3. Check Authentication
Comments require authentication. Verify:
- User is logged in
- Access token is present in localStorage
- Token is being sent in Authorization header

### 4. Test Backend Directly
Run the test script:
```powershell
.\test_comments.ps1
```

This will test:
1. Login and get authentication token
2. Get list of articles
3. Get existing comments
4. Create a new comment
5. Verify comment was created

### 5. Common Issues and Solutions

#### Issue 1: 401 Unauthorized
**Cause**: User not authenticated or token expired
**Solution**: 
- Check if user is logged in
- Verify token in localStorage
- Try logging out and back in

#### Issue 2: 403 Forbidden
**Cause**: User doesn't have permission to create comments
**Solution**:
- Check user role and permissions
- Verify `CanManageComments` permission allows authenticated users to create comments

#### Issue 3: 400 Bad Request
**Cause**: Invalid data being sent
**Solution**:
- Check the request payload
- Ensure `content` field is not empty
- Verify article ID is valid

#### Issue 4: CORS Error
**Cause**: Frontend and backend on different domains
**Solution**:
- Check CORS settings in Django settings.py
- Ensure frontend URL is in CORS_ALLOWED_ORIGINS

#### Issue 5: Network Error
**Cause**: Backend not running or wrong URL
**Solution**:
- Verify backend is running on http://localhost:8000
- Check API_BASE_URL in frontend/src/services/api.ts
- Ensure it's set to `http://localhost:8000/api/v1`

### 6. Frontend Code Flow

When user clicks "Send":
1. `handleSubmit` function is called in CommentSection component
2. Checks if user is authenticated
3. Validates comment is not empty
4. Calls `commentService.createComment()`
5. CommentService makes POST request to `/articles/{id}/comments/`
6. On success, clears input and reloads comments
7. On error, displays error message

### 7. Backend Code Flow

When POST request arrives:
1. DRF routes to `ArticleCommentViewSet.create()`
2. `CanManageComments` permission checks if user is authenticated
3. `CommentSerializer` validates the data
4. `perform_create()` sets author and article_id
5. Comment is saved to database
6. Serialized comment is returned

## Quick Fixes to Try

### Fix 1: Add Console Logging
Add this to `CommentSection.tsx` or `CommentSectionNew.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submit clicked!');
  console.log('Is authenticated:', isAuthenticated);
  console.log('Comment content:', newComment);
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    navigate('/login');
    return;
  }

  if (!newComment.trim()) {
    console.log('Comment is empty');
    setError('Комментарий не может быть пустым');
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('Calling commentService.createComment with:', {
      article: articleId,
      content: newComment,
    });
    
    const result = await commentService.createComment({
      article: articleId,
      content: newComment,
    });
    
    console.log('Comment created successfully:', result);
    setNewComment('');
    await loadComments();
  } catch (err: any) {
    console.error('Error creating comment:', err);
    console.error('Error response:', err.response);
    setError(err.response?.data?.detail || 'Не удалось добавить комментарий');
  } finally {
    setLoading(false);
  }
};
```

### Fix 2: Check Form Submission
Verify the form has `onSubmit={handleSubmit}` and button has `type="submit"`:

```tsx
<form onSubmit={handleSubmit}>
  <TextField ... />
  <Button type="submit" ...>
    Отправить
  </Button>
</form>
```

### Fix 3: Verify API Configuration
Check `frontend/src/services/api.ts`:
- baseURL should be `http://localhost:8000/api/v1`
- Authorization header should be added in request interceptor

### Fix 4: Check Backend Logs
Look at Django console for:
- Incoming POST requests
- Any errors or exceptions
- Permission denied messages

## Testing Checklist

- [ ] Backend server is running
- [ ] Frontend dev server is running
- [ ] User is logged in
- [ ] Article page loads correctly
- [ ] Comment form is visible
- [ ] Browser console shows no errors
- [ ] Network tab shows POST request when clicking Send
- [ ] Backend logs show incoming request
- [ ] Comment appears after creation

## Expected Behavior

1. User types comment in text field
2. Clicks "Отправить" (Send) button
3. Button shows "Отправка..." (Sending...)
4. Comment is sent to backend
5. Comment appears in the list
6. Text field is cleared
7. Button returns to "Отправить"

## Files to Check

### Frontend
- `frontend/src/components/CommentSection.tsx`
- `frontend/src/components/CommentSectionNew.tsx`
- `frontend/src/services/commentService.ts`
- `frontend/src/services/api.ts`
- `frontend/src/contexts/AuthContext.tsx`

### Backend
- `backend/news/views.py` - ArticleCommentViewSet
- `backend/news/serializers.py` - CommentSerializer
- `backend/news/urls.py` - URL routing
- `backend/accounts/permissions.py` - CanManageComments
- `backend/pulse_news/settings/base.py` - CORS settings
