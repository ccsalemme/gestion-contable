# =============================================================================
# SCRIPT DE EJECUCIÓN DE TODOS LOS TESTS
# =============================================================================
# Ejecuta toda la suite de tests de la aplicación en orden:
# 1. Tests unitarios backend
# 2. Tests integración backend  
# 3. Tests unitarios frontend
# 4. Tests E2E completos
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "🧪 ================================================" -ForegroundColor Cyan
Write-Host "🧪 INICIANDO SUITE COMPLETA DE TESTS" -ForegroundColor Cyan
Write-Host "🧪 ================================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    "Backend Unit" = $false
    "Backend Integration" = $false
    "Frontend Unit" = $false
    "E2E Full" = $false
}

$startTime = Get-Date

# =============================================================================
# 1. TESTS UNITARIOS BACKEND
# =============================================================================
Write-Host "📦 [1/4] Ejecutando Tests Unitarios Backend..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location backend
    npm test -- --testPathPattern="tests/backend/unit" --passWithNoTests
    if ($LASTEXITCODE -eq 0) {
        $testResults["Backend Unit"] = $true
        Write-Host "✅ Tests unitarios backend PASARON" -ForegroundColor Green
    } else {
        Write-Host "❌ Tests unitarios backend FALLARON" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "❌ Error ejecutando tests unitarios backend: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# 2. TESTS DE INTEGRACIÓN BACKEND
# =============================================================================
Write-Host "🔗 [2/4] Ejecutando Tests de Integración Backend..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location backend
    npm test -- --testPathPattern="tests/backend/integration" --passWithNoTests
    if ($LASTEXITCODE -eq 0) {
        $testResults["Backend Integration"] = $true
        Write-Host "✅ Tests integración backend PASARON" -ForegroundColor Green
    } else {
        Write-Host "❌ Tests integración backend FALLARON" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "❌ Error ejecutando tests integración backend: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# 3. TESTS UNITARIOS FRONTEND
# =============================================================================
Write-Host "⚛️ [3/4] Ejecutando Tests Unitarios Frontend..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location frontend
    npm test -- --run
    if ($LASTEXITCODE -eq 0) {
        $testResults["Frontend Unit"] = $true
        Write-Host "✅ Tests unitarios frontend PASARON" -ForegroundColor Green
    } else {
        Write-Host "❌ Tests unitarios frontend FALLARON" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "❌ Error ejecutando tests unitarios frontend: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# 4. TESTS E2E COMPLETOS (PLAYWRIGHT)
# =============================================================================
Write-Host "🎭 [4/4] Ejecutando Tests E2E Completos..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location tests/e2e
    npx playwright test
    if ($LASTEXITCODE -eq 0) {
        $testResults["E2E Full"] = $true
        Write-Host "✅ Tests E2E PASARON" -ForegroundColor Green
    } else {
        Write-Host "❌ Tests E2E FALLARON" -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "❌ Error ejecutando tests E2E: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host ""

# =============================================================================
# RESUMEN DE RESULTADOS
# =============================================================================
$endTime = Get-Date
$durationSeconds = ($endTime - $startTime).TotalSeconds
$durationMinutes = [Math]::Floor($durationSeconds / 60)
$durationSecondsRemainder = [Math]::Floor($durationSeconds % 60)
$durationString = "{0:D2}:{1:D2}" -f $durationMinutes, $durationSecondsRemainder

Write-Host "🧪 ================================================" -ForegroundColor Cyan
Write-Host "🧪 RESUMEN DE TESTS" -ForegroundColor Cyan
Write-Host "🧪 ================================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅ PASS" } else { "❌ FAIL"; $allPassed = $false }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "$status - $($test.Key)" -ForegroundColor $color
}

Write-Host ""
Write-Host "⏱️  Tiempo total: $durationString" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "🎉 TODOS LOS TESTS PASARON" -ForegroundColor Green
    Write-Host "✓ La aplicación está funcionando correctamente" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  ALGUNOS TESTS FALLARON" -ForegroundColor Red
    Write-Host "Revisa los logs arriba para más detalles" -ForegroundColor Yellow
    exit 1
}
