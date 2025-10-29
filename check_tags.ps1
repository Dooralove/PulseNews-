$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/tags/ -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Tags count:" $content.count
Write-Host "Tags:" ($content | ConvertTo-Json -Depth 2)
