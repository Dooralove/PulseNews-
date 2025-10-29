$body = '{"username": "admin", "password": "admin123"}' | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/auth/login/ -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Login successful!"
Write-Host "Access token:" $content.access.substring(0, 20) + "..."
Write-Host "User:" $content.user.username
Write-Host "Can manage articles:" $content.user.can_manage_articles

# Save token to file for browser testing
$content | ConvertTo-Json -Depth 3 | Out-File -FilePath "auth_token.json" -Encoding UTF8
