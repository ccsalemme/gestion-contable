# =============================================================================
# EJECUCION DE TESTS - VERSION SIMPLE
# =============================================================================
# Solo ejecuta test-webhook.ps1 que ya funciona
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO TESTS DE VALIDACION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# =============================================================================
# TEST DE WEBHOOK
# =============================================================================
Write-Host "Ejecutando test de webhook..." -ForegroundColor Yellow
Write-Host ""

try {
    & "$PSScriptRoot\test-webhook.ps1"
    
    if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
        Write-Host ""
        Write-Host "OK - Tests de webhook completados" -ForegroundColor Green
        $testPassed = $true
    } else {
        Write-Host ""
        Write-Host "FAIL - Tests de webhook fallaron" -ForegroundColor Red
        $testPassed = $false
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    $testPassed = $false
}

# =============================================================================
# RESUMEN
# =============================================================================
$endTime = Get-Date
$durationSeconds = ($endTime - $startTime).TotalSeconds
$durationMinutes = [Math]::Floor($durationSeconds / 60)
$durationSecondsRemainder = [Math]::Floor($durationSeconds % 60)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($testPassed) {
    Write-Host "TESTS PASARON" -ForegroundColor Green
    Write-Host "Tiempo: $durationMinutes min $durationSecondsRemainder seg" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "TESTS FALLARON" -ForegroundColor Red
    Write-Host "Tiempo: $durationMinutes min $durationSecondsRemainder seg" -ForegroundColor Cyan
    exit 1
}
