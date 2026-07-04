# Script de Pre-Deployment Security Check
# Ejecutar este script ANTES de pushear a GitHub

Write-Host "🔒 SECURITY PRE-DEPLOYMENT CHECK" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$hasIssues = $false

# 1. Verificar que .gitignore está actualizado
Write-Host "1. Verificando .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "backend/credentials/") {
    Write-Host "   ✅ .gitignore incluye backend/credentials/" -ForegroundColor Green
} else {
    Write-Host "   ❌ .gitignore NO protege backend/credentials/" -ForegroundColor Red
    $hasIssues = $true
}

# 2. Verificar que las credenciales no están staged
Write-Host "2. Verificando archivos staged..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only 2>$null
if ($stagedFiles -match "google-service-account\.json") {
    Write-Host "   ❌ Credenciales de Google en staging!" -ForegroundColor Red
    Write-Host "      Ejecutar: git rm --cached backend/credentials/google-service-account.json" -ForegroundColor Red
    $hasIssues = $true
} else {
    Write-Host "   ✅ No hay credenciales en staging" -ForegroundColor Green
}

# 3. Buscar secrets hardcodeados
Write-Host "3. Buscando secrets hardcodeados..." -ForegroundColor Yellow
$secretPatterns = @(
    @{Pattern = 'password\s*=\s*[''"](?!.*process\.env)'; Name = "Passwords hardcodeados"},
    @{Pattern = 'JWT_SECRET\s*=\s*[''"]your-'; Name = "JWT_SECRET por defecto"},
    @{Pattern = 'private_key.*BEGIN PRIVATE KEY'; Name = "Private keys en código"}
)

foreach ($pattern in $secretPatterns) {
    $matches = Get-ChildItem -Path backend\src -Recurse -Include *.ts | 
               Select-String -Pattern $pattern.Pattern -SimpleMatch:$false
    
    if ($matches) {
        Write-Host "   ❌ $($pattern.Name) encontrados:" -ForegroundColor Red
        $matches | ForEach-Object {
            Write-Host "      $($_.Path):$($_.LineNumber)" -ForegroundColor Red
        }
        $hasIssues = $true
    }
}

if (-not $hasIssues) {
    Write-Host "   ✅ No se encontraron secrets hardcodeados obvios" -ForegroundColor Green
}

# 4. Verificar existencia de archivos de configuración
Write-Host "4. Verificando archivos de configuración..." -ForegroundColor Yellow

$requiredFiles = @(
    @{Path = "backend\.env.example"; Required = $true},
    @{Path = "backend\.env.render.example"; Required = $false},
    @{Path = "frontend\.env.example"; Required = $true},
    @{Path = "SEGURIDAD-PREPRODUCCION.md"; Required = $false}
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ $($file.Path) existe" -ForegroundColor Green
    } else {
        if ($file.Required) {
            Write-Host "   ❌ $($file.Path) NO existe (REQUERIDO)" -ForegroundColor Red
            $hasIssues = $true
        } else {
            Write-Host "   ⚠️  $($file.Path) NO existe (recomendado)" -ForegroundColor Yellow
        }
    }
}

# 5. Verificar que existe archivo real .env en backend (para desarrollo local)
Write-Host "5. Verificando configuración local..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   ✅ backend\.env existe (para desarrollo local)" -ForegroundColor Green
    
    # Verificar que tiene JWT_SECRET configurado
    $envContent = Get-Content backend\.env -Raw
    if ($envContent -match "JWT_SECRET=(?!your-)(\S+)") {
        Write-Host "   ✅ JWT_SECRET configurado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  JWT_SECRET no configurado o usa valor por defecto" -ForegroundColor Yellow
        Write-Host "      Generar uno nuevo: node -e `"console.log(require('crypto').randomBytes(64).toString('hex'))`"" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  backend\.env NO existe" -ForegroundColor Yellow
    Write-Host "      Copiar desde: cp backend\.env.example backend\.env" -ForegroundColor Yellow
}

# 6. Verificar dependencias vulnerables
Write-Host "6. Verificando dependencias..." -ForegroundColor Yellow
Write-Host "   Ejecutando npm audit..." -ForegroundColor Gray

Push-Location backend
$auditResult = npm audit --audit-level=high --json 2>$null | ConvertFrom-Json
Pop-Location

if ($auditResult.metadata.vulnerabilities.high -gt 0 -or $auditResult.metadata.vulnerabilities.critical -gt 0) {
    Write-Host "   ❌ Vulnerabilidades encontradas:" -ForegroundColor Red
    Write-Host "      Critical: $($auditResult.metadata.vulnerabilities.critical)" -ForegroundColor Red
    Write-Host "      High: $($auditResult.metadata.vulnerabilities.high)" -ForegroundColor Red
    Write-Host "      Ejecutar: npm audit fix" -ForegroundColor Yellow
    $hasIssues = $true
} else {
    Write-Host "   ✅ No se encontraron vulnerabilidades críticas" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan

if ($hasIssues) {
    Write-Host "❌ SE ENCONTRARON PROBLEMAS DE SEGURIDAD" -ForegroundColor Red
    Write-Host "   NO PROCEDER CON EL DEPLOYMENT" -ForegroundColor Red
    Write-Host "   Revisar SEGURIDAD-PREPRODUCCION.md para soluciones" -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ CHECKS DE SEGURIDAD PASADOS" -ForegroundColor Green
    Write-Host ""
    Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
    Write-Host "1. Revisar SEGURIDAD-PREPRODUCCION.md" -ForegroundColor White
    Write-Host "2. Rotar credenciales de Google Service Account" -ForegroundColor White
    Write-Host "3. Configurar variables de entorno en Render" -ForegroundColor White
    Write-Host "4. Configurar GitHub Secrets para frontend" -ForegroundColor White
    Write-Host "5. Verificar que CORS_ORIGIN está configurado correctamente" -ForegroundColor White
    Write-Host ""
    exit 0
}
