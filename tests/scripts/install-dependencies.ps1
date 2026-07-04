# =============================================================================
# INSTALACION DE DEPENDENCIAS DE TESTING
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "INSTALANDO DEPENDENCIAS DE TESTING" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# =============================================================================
# 1. BACKEND
# =============================================================================
Write-Host "[1/3] Backend testing..." -ForegroundColor Yellow

try {
    Push-Location backend
    Write-Host "   Instalando supertest..."
    npm install --save-dev supertest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK - Backend instalado" -ForegroundColor Green
    } else {
        Write-Host "   ERROR - Backend fallo" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# =============================================================================
# 2. FRONTEND
# =============================================================================
Write-Host "[2/3] Frontend testing..." -ForegroundColor Yellow

try {
    Push-Location frontend
    Write-Host "   Instalando vitest y testing-library..."
    npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK - Frontend instalado" -ForegroundColor Green
    } else {
        Write-Host "   ERROR - Frontend fallo" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# =============================================================================
# 3. E2E PLAYWRIGHT
# =============================================================================
Write-Host "[3/3] Playwright E2E..." -ForegroundColor Yellow

try {
    Push-Location tests
    Push-Location e2e
    
    Write-Host "   Instalando playwright..."
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR - Playwright fallo" -ForegroundColor Red
        Pop-Location
        Pop-Location
        exit 1
    }
    
    Write-Host "   Instalando navegadores (puede tardar)..."
    npx playwright install chromium
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK - Playwright instalado" -ForegroundColor Green
    } else {
        Write-Host "   ERROR - Navegadores fallaron" -ForegroundColor Red
        Pop-Location
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Pop-Location
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Pop-Location
    Pop-Location
    exit 1
}

Write-Host ""

# =============================================================================
# RESUMEN
# =============================================================================
$endTime = Get-Date
$durationSeconds = ($endTime - $startTime).TotalSeconds
$durationMinutes = [Math]::Floor($durationSeconds / 60)
$durationSecondsRemainder = [Math]::Floor($durationSeconds % 60)

Write-Host "================================================" -ForegroundColor Green
Write-Host "INSTALACION COMPLETADA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: OK" -ForegroundColor Green
Write-Host "Frontend: OK" -ForegroundColor Green
Write-Host "Playwright: OK" -ForegroundColor Green
Write-Host ""
Write-Host "Tiempo: $durationMinutes min $durationSecondsRemainder seg" -ForegroundColor Cyan
Write-Host ""
Write-Host "EJECUTAR TESTS:" -ForegroundColor Yellow
Write-Host "  .\tests\scripts\run-all-tests.ps1" -ForegroundColor Cyan
Write-Host ""
