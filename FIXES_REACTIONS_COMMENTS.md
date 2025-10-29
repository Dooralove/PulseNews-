# Fixes for Likes/Dislikes and Comments System

## Summary
Fixed "Not Found" and "Bad Request" errors in the likes/dislikes and comments system by properly implementing nested routes and fixing API endpoint inconsistencies.

## Changes Made

### Backend Changes

#### 1. `backend/news/urls.py`
- **Issue**: Conflicting routes between standalone and nested endpoints
- **Fix**: Created separate ViewSets for nested routes (`ArticleCommentViewSet` and `ArticleReactionViewSet`)
- **Changes**:
  - Removed duplicate registrations for comments/reactions under articles
  - Added proper nested routes using `ArticleCommentViewSet` and `ArticleReactionViewSet`

#### 2. `backend/news/views.py`
- **Added**: `ArticleCommentViewSet` class
  - Handles comments under specific articles via nested route `/articles/{id}/comments/`
  - Properly filters comments by `article_pk` from URL kwargs
  - Automatically sets `article_id` when creating comments
  
- **Added**: `ArticleReactionViewSet` class
  - Handles reactions under specific articles via nested route `/articles/{id}/reactions/`
  - Filters reactions by `article_pk` and current user
  - Added `my_reaction` action to get user's current reaction for an article
  - Automatically sets `article_id` when creating reactions

#### 3. `backend/news/serializers.py`
- **CommentSerializer**:
  - Made `article` field optional with `required=False` for nested routes
  - Article ID is now set automatically in the ViewSet

- **ReactionSerializer**:
  - Made `article` field optional with `required=False` for nested routes
  - Improved validation error messages
  - Enhanced `create` method to handle both nested and standalone routes
  - Better error handling for missing article

- **ArticleListSerializer**:
  - Added `likes_count` and `dislikes_count` fields
  - These fields are computed from reactions and returned with article data

### Frontend Changes

#### 4. `frontend/src/services/commentService.ts`
- **Fixed**: Comment creation now uses nested route `/articles/{id}/comments/`
- **Fixed**: Comment deletion uses nested route when `articleId` is provided
- **Changes**:
  - `createComment`: Extracts article ID and posts to nested route
  - `deleteComment`: Added optional `articleId` parameter for nested route

#### 5. `frontend/src/services/reactionService.ts`
- **Added**: `getArticleReaction(articleId)` - Get user's reaction for specific article
- **Added**: `createOrUpdateReaction(data)` - Create or update reaction using nested route
- **Fixed**: All reaction operations now use nested routes `/articles/{id}/reactions/`
- **Changes**:
  - Reactions are now properly created/updated via nested endpoints
  - Better error handling for 404 responses
  - Legacy methods maintained for backward compatibility

#### 6. `frontend/src/pages/ArticleDetail.tsx`
- **Added**: `loadUserReaction()` - Loads user's existing reaction on page load
- **Fixed**: `handleReaction()` now properly:
  - Creates new reactions
  - Updates existing reactions
  - Deletes reactions when clicking the same button twice
  - Reloads article data to show updated counts
- **Changes**:
  - User's reaction state is now loaded from backend
  - Better error messages for failed operations
  - Article counts update immediately after reaction changes

#### 7. `frontend/src/components/CommentSection.tsx`
- **Fixed**: Comment deletion now passes `articleId` to use nested route
- **Changes**:
  - Better error handling with detailed error messages

## API Endpoints

### Comments
- **List**: `GET /api/articles/{article_id}/comments/`
- **Create**: `POST /api/articles/{article_id}/comments/` (body: `{content, parent?}`)
- **Delete**: `DELETE /api/articles/{article_id}/comments/{comment_id}/`

### Reactions
- **List**: `GET /api/articles/{article_id}/reactions/`
- **Get My Reaction**: `GET /api/articles/{article_id}/reactions/my_reaction/`
- **Create/Update**: `POST /api/articles/{article_id}/reactions/` (body: `{value: 1 or -1}`)
- **Delete**: `DELETE /api/articles/{article_id}/reactions/{reaction_id}/`

## Testing

Run the test script to verify endpoints:
```powershell
.\test_reactions_comments.ps1
```

## Expected Behavior

### Likes/Dislikes
1. User clicks "Нравится" → Creates reaction with value=1
2. User clicks "Нравится" again → Deletes the reaction
3. User clicks "Не нравится" after "Нравится" → Updates reaction to value=-1
4. Counts update immediately after any action

### Comments
1. User submits comment → Creates comment via nested route
2. Comment appears immediately in the list
3. User deletes own comment → Removes comment via nested route
4. Moderators can delete any comment

## Error Handling

All operations now have proper error handling:
- 400 Bad Request → Shows validation error message
- 401 Unauthorized → Redirects to login
- 403 Forbidden → Shows permission error
- 404 Not Found → Shows "not found" message
- 500 Server Error → Shows generic error message

## Notes

- All changes are backward compatible
- Standalone routes (`/api/comments/`, `/api/reactions/`) still work for listing user's own data
- Nested routes are preferred for article-specific operations
- Frontend automatically reloads data after mutations to ensure UI consistency
