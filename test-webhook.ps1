# Script de diagnostico para probar el webhook de Google Apps Script
# Este script hace pruebas progresivas para identificar donde esta el problema

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTICO DEL WEBHOOK - APPS SCRIPT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$baseUrl = "http://localhost:3001"
$token = ""

# Función para hacer login y obtener token
function Get-AuthToken {
    Write-Host "Paso 1: Obteniendo token de autenticacion..." -ForegroundColor Yellow
    
    $loginData = @{
        email = "super-admin@contable.local"
        password = "SuperAdmin@123"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "   Token obtenido exitosamente" -ForegroundColor Green
        return $response.access_token
    }
    catch {
        Write-Host "   Error al obtener token: $_" -ForegroundColor Red
        return $null
    }
}

# Función para probar el webhook manualmente
function Test-Webhook {
    param([string]$authToken)
    
    Write-Host ""
    Write-Host "Paso 2: Probando llamada al webhook manualmente..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }

    try {
        Write-Host "   Enviando request a /api/sheets/test-webhook..." -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri "$baseUrl/api/sheets/test-webhook" -Method POST -Headers $headers
        
        Write-Host "   Respuesta del servidor:" -ForegroundColor Green
        Write-Host "      $($response.message)" -ForegroundColor White
        Write-Host ""
        Write-Host "   Ahora revisa los logs del backend en tu terminal" -ForegroundColor Cyan
        Write-Host "      Deberias ver lineas que empiecen con:" -ForegroundColor Cyan
        Write-Host "      TRIGGERING GOOGLE APPS SCRIPT WEB APP" -ForegroundColor Gray
        Write-Host "      WEB APP RESPONSE SUCCESS" -ForegroundColor Gray
        Write-Host "      o" -ForegroundColor Gray
        Write-Host "      WEB APP CALL FAILED" -ForegroundColor Gray
        
        return $true
    }
    catch {
        Write-Host "   Error al llamar al webhook: $_" -ForegroundColor Red
        return $false
    }
}

# Función para crear una operación de prueba
function Test-CreateMovement {
    param([string]$authToken)
    
    Write-Host ""
    Write-Host "Paso 3: Creando una operacion de prueba..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }

    $movementData = @{
        tipoOperacion = "Solo Compra"
        moneda = "USD"
        motivo = "Cable"
        casoEspecial = $false
        estadoTransaccion = "Completada"
        compra = @{
            monto = 999
            contraparte = "Test Diagnostico"
            costo = 1.01
        }
    } | ConvertTo-Json

    try {
        Write-Host "   Enviando operacion..." -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri "$baseUrl/api/sheets/movements" -Method POST -Headers $headers -Body $movementData
        
        Write-Host "   Operacion creada exitosamente" -ForegroundColor Green
        Write-Host "      Rango: $($response.appendedRange)" -ForegroundColor White
        Write-Host ""
        Write-Host "   Revisa los logs del backend para ver:" -ForegroundColor Cyan
        Write-Host "      1. Si se llamo al webhook automaticamente" -ForegroundColor White
        Write-Host "      2. La respuesta del Web App de Google" -ForegroundColor White
        
        return $true
    }
    catch {
        Write-Host "   Error al crear operacion: $_" -ForegroundColor Red
        return $false
    }
}

# EJECUCIÓN DEL SCRIPT
Write-Host "Iniciando diagnóstico..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Obtener token
$token = Get-AuthToken
if (-not $token) {
    Write-Host ""
    Write-Host "No se pudo obtener el token. Verifica:" -ForegroundColor Red
    Write-Host "   1. Que el backend este corriendo en $baseUrl" -ForegroundColor Yellow
    Write-Host "   2. Que las credenciales sean correctas" -ForegroundColor Yellow
    exit 1
}

# Paso 2: Probar webhook manualmente
$webhookSuccess = Test-Webhook -authToken $token
Start-Sleep -Seconds 2

# Paso 3: Crear operación de prueba
$movementSuccess = Test-CreateMovement -authToken $token

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   RESUMEN DEL DIAGNOSTICO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Token obtenido: SI" -ForegroundColor $(if ($token) { "Green" } else { "Red" })
Write-Host "Webhook manual: $(if ($webhookSuccess) { 'SI' } else { 'NO' })" -ForegroundColor $(if ($webhookSuccess) { "Green" } else { "Red" })
Write-Host "Operacion creada: $(if ($movementSuccess) { 'SI' } else { 'NO' })" -ForegroundColor $(if ($movementSuccess) { "Green" } else { "Red" })
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Revisa los logs del backend en tu terminal" -ForegroundColor Yellow
Write-Host "   Busca las secciones marcadas con emojis" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Si ves 'WEB APP CALL FAILED', copia el error y enviamelo" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Si ves 'WEB APP RESPONSE SUCCESS', pero las filas no se procesan:" -ForegroundColor Yellow
Write-Host "   - El problema esta en el codigo de Google Apps Script" -ForegroundColor Gray
Write-Host "   - Necesitaras que alguien acceda al Apps Script y revise los logs" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Ve a FORM_INPUT en Google Sheets y verifica:" -ForegroundColor Yellow
Write-Host "   - Se creo la fila 'Test Diagnostico'?" -ForegroundColor Gray
Write-Host "   - La columna K dice 'Pendiente' o 'Procesado'?" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
