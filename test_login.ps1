$body = '{"username": "admin", "password": "admin123"}' | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/token/ -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Access token:" $content.access
Write-Host "User:" $content.user.username
Write-Host "Can manage articles:" $content.user.can_manage_articles
