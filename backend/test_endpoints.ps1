Write-Host "=== FARMVERSE BACKEND API VERIFICATION ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:8081"

# 1. Login
Write-Host "`n1. Testing Login Endpoint (bob@farmverse.com)..." -ForegroundColor Yellow
$loginBody = @{
    email = "bob@farmverse.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    $farmOwnerId = $loginRes.id
    Write-Host "Success! Token retrieved (starts with: Bearer $($token.Substring(0, 15))...)" -ForegroundColor Green
    Write-Host "User Role: $($loginRes.role), User Name: $($loginRes.name)" -ForegroundColor Green
} catch {
    Write-Error "Login failed: $_"
    exit
}

# Setup Headers for Auth requests
$headers = @{
    Authorization = "Bearer $token"
}

# 2. Get Farms
Write-Host "`n2. Testing Get Farms Endpoint..." -ForegroundColor Yellow
try {
    $farms = Invoke-RestMethod -Uri "$baseUrl/api/farms" -Method Get -Headers $headers
    Write-Host "Success! Found $($farms.Count) Farm(s):" -ForegroundColor Green
    foreach ($f in $farms) {
        Write-Host " - Farm ID: $($f.id), Name: $($f.name), Location: $($f.location), Soil Type: $($f.soilType)" -ForegroundColor Green
    }
    $farmId = $farms[0].id
} catch {
    Write-Error "Get Farms failed: $_"
}

# 3. Get Recommendations
Write-Host "`n3. Testing Smart Crop Recommendations Endpoint for Farm ID $farmId..." -ForegroundColor Yellow
try {
    $recommendations = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/farm/$farmId/recommendations" -Method Get -Headers $headers
    Write-Host "Soil Status: $($recommendations.soilStatus)" -ForegroundColor Green
    Write-Host "Crop Suitability: $($recommendations.cropSuitability)" -ForegroundColor Green
    Write-Host "Action Required: $($recommendations.actionRequired)" -ForegroundColor Green
} catch {
    Write-Error "Get Recommendations failed: $_"
}

# 4. Get Active Alerts
Write-Host "`n4. Testing Active Alerts Endpoint..." -ForegroundColor Yellow
try {
    $alerts = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/farm/$farmId/alerts" -Method Get -Headers $headers
    Write-Host "Active Alert Count: $($alerts.Count)" -ForegroundColor Green
    foreach ($a in $alerts) {
        Write-Host "  [$($a.severity)] alert id $($a.id): $($a.message)" -ForegroundColor Red
    }
} catch {
    Write-Error "Get Alerts failed: $_"
}

# 5. Ingest New Telemetry (Public endpoint, simulate ESP32 node uploading low moisture)
Write-Host "`n5. Posting Telemetry data from Soil Node Alpha (Moisture = 22.0%, triggering threshold)..." -ForegroundColor Yellow
$telemetryBody = @{
    macAddress = "AA:BB:CC:DD:EE:01"
    moisture = 22.0
    nitrogen = 25.0
    phosphorus = 15.0
    potassium = 35.0
    temperature = 28.5
    humidity = 65.0
} | ConvertTo-Json

try {
    $telemetryRes = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/telemetry" -Method Post -Body $telemetryBody -ContentType "application/json"
    Write-Host "Success! Data ingested with ID $($telemetryRes.id) at $($telemetryRes.timestamp)" -ForegroundColor Green
} catch {
    Write-Error "Telemetry ingestion failed: $_"
}

# 6. Verify alerts list
Write-Host "`n6. Checking active alerts..." -ForegroundColor Yellow
try {
    $alertsAfter = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/farm/$farmId/alerts" -Method Get -Headers $headers
    Write-Host "Active Alert Count: $($alertsAfter.Count)" -ForegroundColor Green
    foreach ($a in $alertsAfter) {
        Write-Host "  [$($a.severity)] alert id $($a.id): $($a.message)" -ForegroundColor Red
    }
} catch {
    Write-Error "Checking alerts failed: $_"
}

# 7. Resolve Alert 2
Write-Host "`n7. Resolving alert ID 2..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/alerts/2/resolve" -Method Post -Headers $headers
    Write-Host "Server Response: $res" -ForegroundColor Green
} catch {
    Write-Error "Resolving alert failed: $_"
}

# 8. Verify alert count dropped
Write-Host "`n8. Verifying active alerts count after resolving alert ID 2..." -ForegroundColor Yellow
try {
    $alertsFinal = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/farm/$farmId/alerts" -Method Get -Headers $headers
    Write-Host "Active Alert Count: $($alertsFinal.Count)" -ForegroundColor Green
    foreach ($a in $alertsFinal) {
        Write-Host "  [$($a.severity)] alert id $($a.id): $($a.message)" -ForegroundColor Red
    }
} catch {
    Write-Error "Final alerts check failed: $_"
}

Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Cyan
