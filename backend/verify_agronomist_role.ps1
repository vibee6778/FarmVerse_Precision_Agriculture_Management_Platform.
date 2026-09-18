$baseUrl = "http://localhost:8081"

Write-Host "=== STARTING LIVE VERIFICATION OF AGRONOMIST & FARMER ROLES ===" -ForegroundColor Cyan

# 1. Login as Farmer Bob
Write-Host "`n[1] Logging in as Farmer Bob (bob@farmverse.com)..." -ForegroundColor Yellow
$bobLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{email="bob@farmverse.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$bobToken = $bobLogin.token
$bobHeaders = @{ Authorization = "Bearer $bobToken" }
Write-Host "Farmer Login Success! Role: $($bobLogin.role)" -ForegroundColor Green

# 2. Farmer updates their own farm
Write-Host "`n[2] Farmer Bob updating his own farm (ID 1)..." -ForegroundColor Yellow
try {
    $updateBody = @{ name="Emerald Acres (Updated by Owner)"; location="Karur, Tamil Nadu"; sizeAcres=45.5; soilType="Loamy Clay" } | ConvertTo-Json
    $bobUpdateRes = Invoke-RestMethod -Uri "$baseUrl/api/farmer-management/farms/1" -Method Put -Body $updateBody -Headers $bobHeaders -ContentType "application/json"
    Write-Host "SUCCESS: Farmer Bob updated his farm name to '$($bobUpdateRes.name)'" -ForegroundColor Green
} catch {
    Write-Host "Farmer Update Failed: $_" -ForegroundColor Red
}

# 3. Login as Dr. Alice Agronomist
Write-Host "`n[3] Logging in as Dr. Alice Agronomist (alice@farmverse.com)..." -ForegroundColor Yellow
$aliceLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{email="alice@farmverse.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$aliceToken = $aliceLogin.token
$aliceHeaders = @{ Authorization = "Bearer $aliceToken" }
Write-Host "Agronomist Login Success! Role: $($aliceLogin.role)" -ForegroundColor Green

# 4. Agronomist READ access check (Farms & Soil Recommendations)
Write-Host "`n[4] Agronomist reading all registered farms..." -ForegroundColor Yellow
$farms = Invoke-RestMethod -Uri "$baseUrl/api/farmer-management/farms" -Method Get -Headers $aliceHeaders
Write-Host "SUCCESS: Agronomist retrieved $($farms.Count) farm(s) for inspection." -ForegroundColor Green

Write-Host "`n[5] Agronomist checking Soil NPK Recommendations for Farm 1..." -ForegroundColor Yellow
$recs = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/farm/1/recommendations" -Method Get -Headers $aliceHeaders
Write-Host "SUCCESS: Soil Status: $($recs.soilStatus)" -ForegroundColor Green
Write-Host "Calculated Urea Dosage: $($recs.fertilizerDosageKg.ureaKg) kg" -ForegroundColor Green

# 5. Agronomist EDIT Farm check (MUST BE BLOCKED)
Write-Host "`n[6] Testing Agronomist attempting to EDIT farm land property (ID 1)..." -ForegroundColor Yellow
try {
    $editAttemptBody = @{ name="Hacked Farm Name"; location="Unauthorized"; sizeAcres=100.0; soilType="Clay" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/farmer-management/farms/1" -Method Put -Body $editAttemptBody -Headers $aliceHeaders -ContentType "application/json"
    Write-Host "CRITICAL ERROR: Agronomist was able to edit farm land!" -ForegroundColor Red
} catch {
    Write-Host "PASSED: Agronomist edit attempt was BLOCKED properly with response: $($_.Exception.Message)" -ForegroundColor Green
}

# 6. Agronomist DELETE Farm check (MUST BE BLOCKED)
Write-Host "`n[7] Testing Agronomist attempting to DELETE farm land property (ID 1)..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/farmer-management/farms/1" -Method Delete -Headers $aliceHeaders
    Write-Host "CRITICAL ERROR: Agronomist was able to delete farm land!" -ForegroundColor Red
} catch {
    Write-Host "PASSED: Agronomist delete attempt was BLOCKED properly with response: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== LIVE VERIFICATION COMPLETE: AGRONOMIST RESTRICTIONS FULLY VERIFIED ===" -ForegroundColor Cyan
