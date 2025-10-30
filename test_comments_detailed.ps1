# Detailed test to see the actual comment data
Write-Host "Testing Comment Data Structure" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api/v1"
$articleId = 5

Write-Host "Getting comments for article $articleId" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId/comments/" -Method Get
    
    Write-Host "Response type: $($response.GetType().Name)" -ForegroundColor White
    Write-Host "Is array: $($response -is [array])" -ForegroundColor White
    Write-Host "Count: $($response.Count)" -ForegroundColor White
    Write-Host ""
    
    if ($response.Count -gt 0) {
        Write-Host "First comment structure:" -ForegroundColor Yellow
        $firstComment = $response[0]
        Write-Host ($firstComment | ConvertTo-Json -Depth 3)
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
