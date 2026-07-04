# =============================================================================
# SCRIPT DE INSTALACIÓN RÁPIDA DE DEPENDENCIAS DE TESTING
# =============================================================================
# Este script instala todas las dependencias necesarias para ejecutar tests
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "📦 ================================================" -ForegroundColor Cyan
Write-Host "📦 INSTALANDO DEPENDENCIAS DE TESTING" -ForegroundColor Cyan
Write-Host "📦 ================================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# =============================================================================
# 1. BACKEND TESTING DEPENDENCIES
# =============================================================================
Write-Host "🔧 [1/3] Instalando dependencias de testing backend..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location backend
    
    Write-Host "   → Instalando supertest..." -ForegroundColor Gray
    npm install --save-dev supertest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencias backend instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error instalando dependencias backend" -ForegroundColor Red
        exit 1
    }
    
    Pop-Location
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# =============================================================================
# 2. FRONTEND TESTING DEPENDENCIES
# =============================================================================
Write-Host "⚛️  [2/3] Instalando dependencias de testing frontend..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location frontend
    
    Write-Host "   → Instalando vitest y testing-library..." -ForegroundColor Gray
    npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencias frontend instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error instalando dependencias frontend" -ForegroundColor Red
        exit 1
    }
    
    Pop-Location
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# =============================================================================
# 3. E2E TESTING DEPENDENCIES (PLAYWRIGHT)
# =============================================================================
Write-Host "🎭 [3/3] Instalando Playwright para E2E testing..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location tests/e2e
    
    Write-Host "   → Instalando @playwright/test..." -ForegroundColor Gray
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error instalando playwright" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Write-Host "   → Instalando navegadores Chromium..." -ForegroundColor Gray
    Write-Host "   (Esto puede tardar varios minutos...)" -ForegroundColor Gray
    npx playwright install chromium
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Playwright instalado correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error instalando navegadores" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
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
$durationString = "{0:D2}:{1:D2}" -f $durationMinutes, $durationSecondsRemainder

Write-Host "🎉 ================================================" -ForegroundColor Green
Write-Host "🎉 INSTALACION COMPLETADA" -ForegroundColor Green
Write-Host "🎉 ================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend testing dependencies instaladas" -ForegroundColor Green
Write-Host "✅ Frontend testing dependencies instaladas" -ForegroundColor Green
Write-Host "✅ Playwright E2E instalado" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️  Tiempo total: $durationString" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Ejecutar todos los tests:" -ForegroundColor White
Write-Host "      .\tests\scripts\run-all-tests.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "   2. Ejecutar tests individuales:" -ForegroundColor White
Write-Host "      cd backend" -ForegroundColor Gray
Write-Host "      npm test" -ForegroundColor Cyan
Write-Host ""
Write-Host "      cd frontend" -ForegroundColor Gray
Write-Host "      npm test" -ForegroundColor Cyan
Write-Host ""
Write-Host "   3. Ver documentacion: tests\INDEX.md" -ForegroundColor White
Write-Host ""
