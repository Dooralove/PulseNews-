# Test script for reactions and comments API
$baseUrl = "http://localhost:8000/api"

Write-Host "Testing Reactions and Comments API" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Test 1: Get all articles
Write-Host "`n1. Getting articles..." -ForegroundColor Yellow
try {
    $articles = Invoke-RestMethod -Uri "$baseUrl/articles/" -Method Get
    Write-Host "✓ Articles retrieved: $($articles.count) articles" -ForegroundColor Green
    if ($articles.results.Count -gt 0) {
        $testArticleId = $articles.results[0].id
        Write-Host "  Using article ID: $testArticleId for testing" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Failed to get articles: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Get comments for an article (nested route)
Write-Host "`n2. Getting comments for article $testArticleId..." -ForegroundColor Yellow
try {
    $comments = Invoke-RestMethod -Uri "$baseUrl/articles/$testArticleId/comments/" -Method Get
    Write-Host "✓ Comments retrieved: $($comments.Count) comments" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get comments: $_" -ForegroundColor Red
}

# Test 3: Check if endpoints exist
Write-Host "`n3. Checking endpoint availability..." -ForegroundColor Yellow

$endpoints = @(
    "/articles/",
    "/articles/$testArticleId/",
    "/articles/$testArticleId/comments/",
    "/articles/$testArticleId/reactions/",
    "/comments/",
    "/reactions/"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method Get -ErrorAction Stop
        Write-Host "✓ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $endpoint - Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "Testing complete!" -ForegroundColor Green
