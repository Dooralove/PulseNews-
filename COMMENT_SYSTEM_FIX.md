# Comment System Fix

## Changes Made

### 1. Added Console Logging for Debugging

Updated both comment components to add detailed console logging:
- `frontend/src/components/CommentSection.tsx`
- `frontend/src/components/CommentSectionNew.tsx`

The logging will help identify:
- If the submit button is being clicked
- If the user is authenticated
- What data is being sent
- Any errors from the API

### 2. Created Test Scripts

**`test_comments.ps1`** - PowerShell script to test the comment API directly:
- Tests login and authentication
- Gets list of articles
- Retrieves existing comments
- Creates a new comment
- Verifies comment creation

### 3. Created Debug Documentation

**`COMMENT_SYSTEM_DEBUG.md`** - Comprehensive debugging guide covering:
- Investigation steps
- Common issues and solutions
- Frontend and backend code flow
- Quick fixes to try
- Testing checklist

## How to Debug the Issue

### Step 1: Check Browser Console
1. Open the article page
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try to submit a comment
5. Look for console.log messages starting with "CommentSection:" or "CommentSectionNew:"

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Try to submit a comment
3. Look for a POST request to `/api/v1/articles/{id}/comments/`
4. Check the request status:
   - 200/201: Success
   - 400: Bad request (check request payload)
   - 401: Not authenticated
   - 403: Permission denied
   - 500: Server error

### Step 3: Test Backend Directly
Run the PowerShell test script:
```powershell
cd "c:\Users\user\Desktop\5 SEM\жцрпо\project\PulseNews"
.\test_comments.ps1
```

Update the username/password in the script if needed.

## Expected Console Output

When clicking "Send", you should see:
```
CommentSection: Submit clicked
CommentSection: Is authenticated: true
CommentSection: Article ID: 1
CommentSection: Comment content: Test comment
CommentSection: Calling commentService.createComment
CommentSection: Comment created successfully: {id: 1, content: "Test comment", ...}
```

## Common Issues

### Issue 1: Nothing in Console
**Problem**: No console logs appear when clicking Send
**Cause**: Button click handler not connected or form not submitting
**Solution**: Check that:
- Form has `onSubmit={handleSubmit}`
- Button has `type="submit"`
- Button is inside the form element

### Issue 2: "Not authenticated" in Console
**Problem**: Console shows "Not authenticated, redirecting to login"
**Cause**: User not logged in or token expired
**Solution**:
- Log out and log back in
- Check localStorage for 'access_token'
- Verify AuthContext is providing isAuthenticated

### Issue 3: Network Error
**Problem**: Console shows network error or CORS error
**Cause**: Backend not running or CORS misconfigured
**Solution**:
- Ensure backend is running on http://localhost:8000
- Check CORS settings in Django
- Verify API_BASE_URL in frontend

### Issue 4: 403 Forbidden
**Problem**: Request returns 403 status
**Cause**: User doesn't have permission
**Solution**:
- Check user role and permissions
- Verify CanManageComments allows authenticated users
- Check if user account is active

## Next Steps

1. **Run the application**:
   - Start backend: `python manage.py runserver`
   - Start frontend: `npm start`

2. **Open an article page**

3. **Open browser DevTools (F12)**

4. **Try to submit a comment**

5. **Check console output** and share any error messages

6. **If backend test works but frontend doesn't**, the issue is in the frontend

7. **If backend test fails**, the issue is in the backend configuration

## Files Modified

- `frontend/src/components/CommentSection.tsx` - Added console logging
- `frontend/src/components/CommentSectionNew.tsx` - Added console logging
- `test_comments.ps1` - Created test script
- `COMMENT_SYSTEM_DEBUG.md` - Created debug guide

## Testing Checklist

Before reporting the issue:
- [ ] Backend server is running
- [ ] Frontend dev server is running  
- [ ] User is logged in
- [ ] Article page loads without errors
- [ ] Comment form is visible
- [ ] Checked browser console for errors
- [ ] Checked Network tab for failed requests
- [ ] Ran test_comments.ps1 script
- [ ] Noted any error messages or status codes

## Expected Behavior After Fix

1. User types comment in text field
2. Clicks "Отправить" button
3. Console shows "Submit clicked" message
4. Button changes to "Отправка..."
5. Network tab shows POST request to comments endpoint
6. Request returns 201 Created
7. Comment appears in the list
8. Text field is cleared
9. Button returns to "Отправить"
