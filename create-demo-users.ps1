# Crear usuarios de prueba
$users = @(
    @{"email"="super-admin@contable.local"; "password"="SuperAdmin@123"},
    @{"email"="gerente@empresa1.local"; "password"="Gerente@123"},
    @{"email"="contador@empresa1.local"; "password"="Contador@123"}
)

Write-Host "Creando usuarios de prueba..." -ForegroundColor Cyan

foreach ($user in $users) {
    $headers = @{"Content-Type" = "application/json"}
    $body = @{email=$user.email; password=$user.password} | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" `
            -Method POST -Headers $headers -Body $body -UseBasicParsing
        $userData = $response.Content | ConvertFrom-Json
        
        Write-Host "`n✅ Usuario creado" -ForegroundColor Green
        Write-Host "  Email: $($userData.email)"
        Write-Host "  ID: $($userData.id)"
    }
    catch {
        if ($_.Exception.Message -like "*already in use*") {
            Write-Host "`n⚠️  Ya existe: $($user.email)" -ForegroundColor Yellow
        }
        else {
            Write-Host "`n❌ Error creando $($user.email): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✨ Proceso completado!" -ForegroundColor Green
