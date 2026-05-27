# Script para crear usuario de prueba
$headers = @{"Content-Type" = "application/json"}
$body = '{"email":"admin@contable.local","password":"Admin@123"}'

try {
    Write-Host "Creando usuario de prueba..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    $user = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✅ Usuario creado exitosamente!`n" -ForegroundColor Green
    Write-Host "ID:    " -ForegroundColor Yellow -NoNewline; Write-Host $user.id
    Write-Host "Email: " -ForegroundColor Yellow -NoNewline; Write-Host $user.email
    Write-Host "Role:  " -ForegroundColor Yellow -NoNewline; Write-Host $user.role
    Write-Host "`nToken:" -ForegroundColor Yellow
    Write-Host $user.token -ForegroundColor Cyan
    
}
catch {
    Write-Host "❌ Error al crear usuario:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Si es 409 (conflict), el usuario ya existe
    if ($_.Exception.Message -like "*409*") {
        Write-Host "`nEl usuario ya existe. Intenta con otro email." -ForegroundColor Yellow
    }
}
