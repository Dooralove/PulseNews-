# Simple test to check if comments are returned
Write-Host "Testing Comment Retrieval" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api/v1"

# Test 1: Get articles
Write-Host "Step 1: Get first published article" -ForegroundColor Yellow
try {
    $articlesResponse = Invoke-RestMethod -Uri "$baseUrl/articles/?status=published" -Method Get
    if ($articlesResponse.results.Count -gt 0) {
        $articleId = $articlesResponse.results[0].id
        $articleTitle = $articlesResponse.results[0].title
        Write-Host "Success! Found article: $articleTitle (ID: $articleId)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "No articles found" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Get comments for this article
Write-Host "Step 2: Get comments for article $articleId" -ForegroundColor Yellow
try {
    $commentsResponse = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId/comments/" -Method Get
    Write-Host "Success! Found $($commentsResponse.Count) comments" -ForegroundColor Green
    
    if ($commentsResponse.Count -gt 0) {
        Write-Host ""
        Write-Host "Comments:" -ForegroundColor White
        foreach ($comment in $commentsResponse) {
            Write-Host "  - ID: $($comment.id)" -ForegroundColor Gray
            Write-Host "    Author: $($comment.author.username)" -ForegroundColor Gray
            Write-Host "    Content: $($comment.content)" -ForegroundColor Gray
            Write-Host "    Created: $($comment.created_at)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "No comments found for this article" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
