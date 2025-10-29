$body = '{"username": "admin", "password": "admin123"}' | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/auth/login/ -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Status Code:" $response.StatusCode
    Write-Host "Access token length:" $content.access.Length
    if ($content.user) {
        Write-Host "Username:" $content.user.username
        Write-Host "Email:" $content.user.email
        Write-Host "Can manage articles:" $content.user.can_manage_articles
        Write-Host "Is staff:" $content.user.is_staff
    } else {
        Write-Host "User data not found in response"
    }
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "Response status:" $_.Exception.Response.StatusCode
        Write-Host "Response content:" $_.Exception.Response.Content
    }
}
