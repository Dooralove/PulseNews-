# Test script for user registration
$baseUrl = "http://localhost:8000/api/v1"

Write-Host "Testing User Registration API" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Test data
$registrationData = @{
    username = "testuser_$(Get-Random -Maximum 10000)"
    email = "testuser_$(Get-Random -Maximum 10000)@example.com"
    password = "TestPassword123!"
    password2 = "TestPassword123!"
    first_name = "Test"
    last_name = "User"
    role = 2
    phone = "+1234567890"
} | ConvertTo-Json

Write-Host "`nRegistration data:" -ForegroundColor Yellow
Write-Host $registrationData

Write-Host "`nAttempting registration..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register/" `
        -Method Post `
        -Body $registrationData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "`nUser data:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 3)
    
    if ($response.access) {
        Write-Host "`n✓ Access token received" -ForegroundColor Green
    }
    if ($response.refresh) {
        Write-Host "✓ Refresh token received" -ForegroundColor Green
    }
    if ($response.user) {
        Write-Host "✓ User data received" -ForegroundColor Green
        Write-Host "  - Username: $($response.user.username)" -ForegroundColor Cyan
        Write-Host "  - Email: $($response.user.email)" -ForegroundColor Cyan
        Write-Host "  - Role: $($response.user.role.display_name)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "✗ Registration failed!" -ForegroundColor Red
    Write-Host "`nError details:" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n==============================" -ForegroundColor Green
Write-Host "Test complete!" -ForegroundColor Green
