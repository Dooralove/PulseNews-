# Test script for checking API endpoints
$baseUrl = "http://localhost:8000/api/v1"

Write-Host "Testing API Endpoints" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

$endpoints = @(
    @{ Path = "/roles/"; Description = "Roles list" },
    @{ Path = "/accounts/roles/"; Description = "Roles list (accounts prefix)" },
    @{ Path = "/users/"; Description = "Users list" },
    @{ Path = "/articles/"; Description = "Articles list" },
    @{ Path = "/categories/"; Description = "Categories list" },
    @{ Path = "/tags/"; Description = "Tags list" },
    @{ Path = "/auth/register/"; Description = "Registration endpoint" },
    @{ Path = "/auth/login/"; Description = "Login endpoint" }
)

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$($endpoint.Path)"
    Write-Host "`nTesting: $($endpoint.Description)" -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -ErrorAction Stop
        Write-Host "✓ Status: $($response.StatusCode) - OK" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "✓ Status: 401 - Requires authentication (endpoint exists)" -ForegroundColor Yellow
        } elseif ($statusCode -eq 403) {
            Write-Host "✓ Status: 403 - Forbidden (endpoint exists)" -ForegroundColor Yellow
        } elseif ($statusCode -eq 404) {
            Write-Host "✗ Status: 404 - Not Found" -ForegroundColor Red
        } else {
            Write-Host "? Status: $statusCode" -ForegroundColor Magenta
        }
    }
}

Write-Host "`n=====================" -ForegroundColor Green
Write-Host "Test complete!" -ForegroundColor Green
