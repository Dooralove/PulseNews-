# Article Status System Implementation

## Overview
Implemented a complete article state management system with "Published" and "Drafts" functionality, including the ability to publish and unpublish articles.

## Changes Made

### Backend Changes

#### 1. `backend/news/views.py`
- **Updated `ArticleViewSet` queryset**: Changed from filtering only published articles to showing all articles, allowing proper draft management
- **Added status filtering**: Added `'status': ['exact']` to `filterset_fields` to enable filtering by article status
- **Fixed ordering**: Changed default ordering from `-published_at` to `-created_at` to properly display drafts
- **Refactored `get_queryset` method**: Now properly handles explicit status filters:
  - When `status=published` is provided, only published articles are returned
  - When `status=draft` is provided, only the user's own drafts are returned
  - When no status filter is provided, default visibility rules apply
- **Updated `publish` action**: Now returns serialized article data instead of just a status message
- **Added `unpublish` action**: New endpoint to move published articles back to draft status

```python
@action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
def unpublish(self, request, pk=None):
    """Custom action to unpublish an article (move to draft)."""
    article = self.get_object()
    if article.author != request.user and not request.user.is_staff:
        return Response(
            {"detail": "You don't have permission to unpublish this article."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    article.status = 'draft'
    article.save()
    
    # Log article update activity
    log_user_activity(request.user, 'article_update', request, {
        'article_id': article.id,
        'article_title': article.title,
        'action': 'unpublished'
    })
    
    serializer = self.get_serializer(article)
    return Response(serializer.data)
```

#### 2. `backend/news/models.py`
- **Updated `Article.save()` method**: 
  - Sets `published_at` when article status changes to 'published'
  - Clears `published_at` when article is moved back to 'draft' status
  - Ensures draft articles never have a published date

#### 3. `backend/news/serializers.py`
- **Updated `ArticleListSerializer`**: Added `status` and `created_at` fields to the serializer so the frontend can display article status and creation date

### Frontend Changes

#### 4. `frontend/src/services/articleService.ts`
- **Added `unpublishArticle` method**: New service method to call the unpublish endpoint
- **Updated `getArticles` interface**: Added `status` and `page_size` parameters to the method signature

```typescript
async unpublishArticle(id: number): Promise<Article> {
  const response = await api.post<Article>(`/articles/${id}/unpublish/`);
  return response.data;
}
```

#### 5. `frontend/src/pages/MyArticles.tsx`
- **Added publish/unpublish handlers**: Implemented `handlePublish` and `handleUnpublish` functions
- **Added publish/unpublish buttons**: Added conditional buttons in the article card actions:
  - Draft articles show a green "Publish" button (Publish icon)
  - Published articles show an orange "Unpublish" button (Unpublished icon)
- **Imported icons**: Added `Publish` and `Unpublished` icons from Material-UI

#### 6. `frontend/src/pages/Home.tsx` & `frontend/src/pages/ArticleList.tsx`
- **Added status filter**: Both pages now explicitly filter for `status: 'published'` to ensure only published articles appear on the main pages
- **Prevents draft leakage**: Ensures draft articles never appear on public-facing pages

## How It Works

### Creating Articles
1. When creating an article, users can toggle the "Опубликовать сразу" (Publish immediately) switch
2. If enabled, the article is created with `status='published'`
3. If disabled, the article is created with `status='draft'`

### Managing Article Status
1. **My Articles Page** displays all user's articles with their current status
2. **Filter by Status**: Users can filter articles by:
   - All articles
   - Published only
   - Drafts only
   - Archived only
3. **Status Indicators**: Each article card shows a colored chip indicating its status:
   - Green: Published
   - Orange: Draft
   - Gray: Archived

### Publishing/Unpublishing
1. **Draft Articles**: Show a green "Publish" button that:
   - Changes article status to 'published'
   - Sets the `published_at` timestamp
   - Updates the article in the list without page reload
   
2. **Published Articles**: Show an orange "Unpublish" button that:
   - Changes article status to 'draft'
   - Keeps the article in the user's list
   - Updates the article in the list without page reload

### Visibility Rules
- **Unauthenticated users**: See only published articles
- **Authenticated users**: See published articles + their own drafts
- **Staff users**: See all articles regardless of status

## API Endpoints

### Publish Article
```
POST /api/articles/{id}/publish/
```
- Requires authentication
- Only author or staff can publish
- Returns updated article data

### Unpublish Article
```
POST /api/articles/{id}/unpublish/
```
- Requires authentication
- Only author or staff can unpublish
- Returns updated article data

## Testing Checklist

- [ ] Create a new article as draft (toggle off "Publish immediately")
- [ ] Verify draft appears in "My Articles" with "Draft" status
- [ ] Click "Publish" button on draft article
- [ ] Verify article status changes to "Published"
- [ ] Verify published article appears in main article list
- [ ] Click "Unpublish" button on published article
- [ ] Verify article status changes back to "Draft"
- [ ] Verify unpublished article no longer appears in main article list
- [ ] Verify unpublished article still appears in "My Articles"
- [ ] Test filter functionality (All, Published, Drafts, Archived)
- [ ] Verify non-authors cannot see other users' drafts

## Benefits

1. **No Data Loss**: Articles are never "lost" when unpublished - they move to drafts
2. **Clear Workflow**: Users can create drafts, review them, and publish when ready
3. **Easy Management**: Simple toggle between published and draft states
4. **Visual Feedback**: Clear status indicators and appropriate action buttons
5. **Proper Permissions**: Only authors and staff can manage article status
