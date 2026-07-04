# =============================================================================
# EJECUCION DE TODOS LOS TESTS
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO SUITE COMPLETA DE TESTS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    "Backend Unit" = $false
    "Backend Integration" = $false
    "Frontend Unit" = $false
    "E2E Full" = $false
}

$startTime = Get-Date

# =============================================================================
# 1. BACKEND UNIT
# =============================================================================
Write-Host "[1/4] Tests Unitarios Backend..." -ForegroundColor Yellow

try {
    Push-Location backend
    npm test -- --testPathPattern="tests/backend/unit" --passWithNoTests
    if ($LASTEXITCODE -eq 0) {
        $testResults["Backend Unit"] = $true
        Write-Host "OK - Backend unit tests pasaron" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Backend unit tests fallaron" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# 2. BACKEND INTEGRATION
# =============================================================================
Write-Host "[2/4] Tests Integracion Backend..." -ForegroundColor Yellow

try {
    Push-Location backend
    npm test -- --testPathPattern="tests/backend/integration" --passWithNoTests
    if ($LASTEXITCODE -eq 0) {
        $testResults["Backend Integration"] = $true
        Write-Host "OK - Backend integration tests pasaron" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Backend integration tests fallaron" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# 3. FRONTEND UNIT
# =============================================================================
Write-Host "[3/4] Tests Unitarios Frontend..." -ForegroundColor Yellow

try {
    Push-Location frontend
    npm test -- --run
    if ($LASTEXITCODE -eq 0) {
        $testResults["Frontend Unit"] = $true
        Write-Host "OK - Frontend unit tests pasaron" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Frontend unit tests fallaron" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# 4. E2E
# =============================================================================
Write-Host "[4/4] Tests E2E..." -ForegroundColor Yellow

try {
    Push-Location tests
    Push-Location e2e
    npx playwright test
    if ($LASTEXITCODE -eq 0) {
        $testResults["E2E Full"] = $true
        Write-Host "OK - E2E tests pasaron" -ForegroundColor Green
    } else {
        Write-Host "FAIL - E2E tests fallaron" -ForegroundColor Red
    }
    Pop-Location
    Pop-Location
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Pop-Location
    Pop-Location
}

Write-Host ""

# =============================================================================
# RESUMEN
# =============================================================================
$endTime = Get-Date
$durationSeconds = ($endTime - $startTime).TotalSeconds
$durationMinutes = [Math]::Floor($durationSeconds / 60)
$durationSecondsRemainder = [Math]::Floor($durationSeconds % 60)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE TESTS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
foreach ($test in $testResults.GetEnumerator()) {
    if ($test.Value) {
        Write-Host "PASS - $($test.Key)" -ForegroundColor Green
    } else {
        Write-Host "FAIL - $($test.Key)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
Write-Host "Tiempo: $durationMinutes min $durationSecondsRemainder seg" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "TODOS LOS TESTS PASARON" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ALGUNOS TESTS FALLARON" -ForegroundColor Red
    exit 1
}
