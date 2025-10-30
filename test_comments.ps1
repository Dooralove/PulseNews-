# Test script to verify comment functionality
Write-Host "Testing Comment System" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:8000/api"

# First, let's login to get a token
Write-Host "Step 1: Login to get authentication token" -ForegroundColor Yellow
$loginData = @{
    username = "admin"
    password = "admin"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login/" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.access
    Write-Host "Success! Got authentication token" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error logging in: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please update the username/password in the script" -ForegroundColor Yellow
    exit
}

# Get list of articles to find an article ID
Write-Host "Step 2: Get list of articles" -ForegroundColor Yellow
try {
    $articlesResponse = Invoke-RestMethod -Uri "$baseUrl/articles/?status=published" -Method Get
    if ($articlesResponse.results.Count -gt 0) {
        $articleId = $articlesResponse.results[0].id
        $articleTitle = $articlesResponse.results[0].title
        Write-Host "Success! Found article: $articleTitle (ID: $articleId)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "No articles found. Please create an article first." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "Error getting articles: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Get existing comments for the article
Write-Host "Step 3: Get existing comments for article $articleId" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $commentsResponse = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId/comments/" -Method Get -Headers $headers
    Write-Host "Success! Found $($commentsResponse.Count) existing comments" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error getting comments: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Create a new comment
Write-Host "Step 4: Create a new comment" -ForegroundColor Yellow
$commentData = @{
    content = "Test comment created at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId/comments/" -Method Post -Body $commentData -Headers $headers
    Write-Host "Success! Comment created with ID: $($createResponse.id)" -ForegroundColor Green
    Write-Host "Content: $($createResponse.content)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Error creating comment: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Verify the comment was created
Write-Host "Step 5: Verify comment was created" -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId/comments/" -Method Get -Headers $headers
    Write-Host "Success! Now there are $($verifyResponse.Count) comments" -ForegroundColor Green
} catch {
    Write-Host "Error verifying comments: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
