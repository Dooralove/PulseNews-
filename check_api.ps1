$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/ -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Available endpoints:"
$content | ConvertTo-Json -Depth 3
