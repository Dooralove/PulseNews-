# Test script to verify article status filtering
Write-Host "Testing Article Status Filtering" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:8000/api"

# Test 1: Get all articles without filter (should follow default rules)
Write-Host "Test 1: Get all articles (no status filter)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/articles/" -Method Get
    Write-Host "Success! Found $($response.count) articles" -ForegroundColor Green
    Write-Host "Article statuses:" -ForegroundColor White
    $response.results | ForEach-Object { Write-Host "  - $($_.title): $($_.status)" }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get only published articles
Write-Host "Test 2: Get published articles only" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/articles/?status=published" -Method Get
    Write-Host "Success! Found $($response.count) published articles" -ForegroundColor Green
    Write-Host "Article statuses:" -ForegroundColor White
    $response.results | ForEach-Object { Write-Host "  - $($_.title): $($_.status)" }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get only draft articles (requires authentication)
Write-Host "Test 3: Get draft articles (requires authentication)" -ForegroundColor Yellow
Write-Host "Skipping - requires authentication token" -ForegroundColor Gray
Write-Host ""

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
