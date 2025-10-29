$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/categories/ -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Categories count:" $content.count
Write-Host "Categories:" ($content | ConvertTo-Json -Depth 2)
