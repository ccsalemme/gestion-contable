# 🔒 ANÁLISIS DE SEGURIDAD PRE-PRODUCCIÓN

**Fecha:** 2026-07-04  
**Estado:** ⚠️ CRÍTICO - NO DESPLEGAR SIN RESOLVER

---

## 🚨 VULNERABILIDADES CRÍTICAS (Bloquean deployment)

### 1. **CREDENCIALES DE GOOGLE EXPUESTAS EN REPOSITORIO** ⚠️⚠️⚠️
**Severidad:** CRÍTICA  
**Archivo:** `backend/credentials/google-service-account.json`

**Problema:**
- Las credenciales de Google Service Account (private key incluida) están en el repositorio
- El archivo NO está en `.gitignore`
- Si subes esto a GitHub, las credenciales quedan PÚBLICAS permanentemente
- Cualquiera con acceso al repo puede usar tu cuenta de Google

**Impacto:**
- Acceso no autorizado a tus Google Sheets
- Uso de tu proyecto de Google Cloud sin tu consentimiento
- Costos inesperados en tu cuenta de Google
- Exposición de datos financieros sensibles

**Solución URGENTE:**
```bash
# 1. Agregar al .gitignore INMEDIATAMENTE
echo "backend/credentials/" >> .gitignore
echo "*.json" >> .gitignore
echo "!package.json" >> .gitignore
echo "!tsconfig*.json" >> .gitignore

# 2. Remover del historial de Git (si ya committeaste)
git rm --cached backend/credentials/google-service-account.json
git commit -m "Remove sensitive credentials"

# 3. ROTAR las credenciales en Google Cloud Console
# - Ve a Google Cloud Console
# - Elimina la service account actual
# - Crea una nueva service account
# - Descarga nuevas credenciales
# - Guárdalas SOLO localmente

# 4. Para producción, usar variables de entorno
# En lugar de un archivo .json, usar GOOGLE_APPLICATION_CREDENTIALS_JSON
```

---

### 2. **JWT_SECRET DÉBIL Y PREDECIBLE**
**Severidad:** CRÍTICA  
**Archivos:** `backend/.env.example`, `backend/src/auth/auth.module.ts`

**Problema:**
- El JWT_SECRET por defecto es `'your-super-secret-jwt-key-change-in-production'`
- Es un valor conocido y predecible
- Permite falsificar tokens JWT

**Solución:**
```bash
# Generar un JWT_SECRET fuerte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# En producción, usar variables de entorno de Render
# NO hardcodear en el código
```

**Archivo:** `backend/src/auth/auth.module.ts` (línea 20)
```typescript
// ❌ MAL - fallback inseguro
const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key'

// ✅ BIEN - forzar configuración en producción
const secret = configService.get<string>('JWT_SECRET')
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production')
}
```

---

### 3. **ENDPOINT DE DEBUG EXPUESTO**
**Severidad:** ALTA  
**Archivo:** `backend/src/auth/auth.controller.ts` (líneas 12-22)

**Problema:**
```typescript
@Public()
@Get('debug/env')
async debugEnv() {
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  return {
    jwt_secret_length: secret.length,
    jwt_secret_first_10: secret.substring(0, 10),
    jwt_secret_last_10: secret.substring(secret.length - 10),
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }
}
```

**Impacto:**
- Expone partes del JWT_SECRET
- Permite ataques de fuerza bruta más fáciles
- Expone información del sistema

**Solución:**
```typescript
// ELIMINAR este endpoint completamente en producción
// O protegerlo con un guard especial:

@Public()
@Get('debug/env')
async debugEnv() {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    throw new ForbiddenException('Debug endpoint only available in development')
  }
  // ... resto del código
}
```

---

### 4. **USUARIOS MOCK HARDCODEADOS CON CONTRASEÑAS CONOCIDAS**
**Severidad:** CRÍTICA  
**Archivo:** `backend/src/auth/auth.service.ts` (líneas 24-52)

**Problema:**
- Usuarios de prueba con contraseñas conocidas
- Incluye un SUPER_ADMIN con credenciales públicas
- Sistema de autenticación en memoria (no persistente)

**Contraseñas expuestas:**
```
admin@contable.local: Admin@123
contador@empresa1.local: Contador@123
gerente@empresa1.local: Gerente@123
super-admin@contable.local: SuperAdmin@123
```

**Solución:**
```typescript
// 1. NO usar mock users en producción
// 2. Implementar base de datos real (PostgreSQL/Supabase)
// 3. Si necesitas mock users en dev:

private async initializeMockUsers() {
  // Solo en desarrollo
  if (process.env.NODE_ENV === 'production') {
    this.logger.warn('Mock users disabled in production')
    return
  }
  
  // Usar contraseñas desde variables de entorno
  const testUsers = [
    {
      email: 'admin@contable.local',
      password: process.env.DEV_ADMIN_PASSWORD || 'random-generated-password',
      role: UserRole.USER_FINAL,
    },
  ]
  // ...
}
```

---

## ⚠️ VULNERABILIDADES ALTAS (Resolver antes de producción)

### 5. **CORS MAL CONFIGURADO**
**Severidad:** ALTA  
**Archivo:** `backend/src/main.ts` (línea 30)

**Problema actual:**
```typescript
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
```

**Riesgo:**
- Si CORS_ORIGIN no se configura en producción, acepta solo localhost
- Si alguien configura CORS_ORIGIN='*', acepta cualquier origen

**Solución para producción:**
```typescript
// backend/src/main.ts
const corsOrigin = process.env.CORS_ORIGIN
if (!corsOrigin) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CORS_ORIGIN must be set in production')
  }
  corsOrigin = 'http://localhost:3000' // Solo para desarrollo
}

// NUNCA permitir '*' en producción
if (corsOrigin === '*' && process.env.NODE_ENV === 'production') {
  throw new Error('Wildcard CORS not allowed in production')
}

app.enableCors({
  origin: corsOrigin.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight por 24h
})
```

---

### 6. **LOGS VERBOSOS EN PRODUCCIÓN**
**Severidad:** MEDIA  
**Archivos:** Múltiples

**Problema:**
- Console.log en todo el código revela información sensible
- Stack traces pueden exponer estructura interna

**Ejemplos de logs problemáticos:**
```typescript
// backend/src/auth/auth.service.ts
console.log(`🔐 Login attempt for: ${loginDto.email}`)
console.log(`✅ Login successful for: ${loginDto.email}`)

// backend/src/main.ts
console.log('🔐 CORS Configuration:')
console.log(`   Allowed origins: ${JSON.stringify(allowedOrigins)}`)
```

**Solución:**
```typescript
// Usar Logger de NestJS en lugar de console.log
private readonly logger = new Logger(AuthService.name)

// Condicional basado en ambiente
if (process.env.NODE_ENV === 'development') {
  this.logger.debug(`Login attempt for: ${loginDto.email}`)
}

// O usar niveles de log apropiados
this.logger.log('User logged in successfully') // Sin email
```

---

### 7. **MANEJO DE ERRORES REVELA INFORMACIÓN SENSIBLE**
**Severidad:** MEDIA  
**Archivo:** `backend/src/common/filters/all-exceptions.filter.ts`

**Problema:**
```typescript
response.status(status).json({
  statusCode: status,
  message,
  error,
  timestamp: new Date().toISOString(),
  path: request.url,  // ⚠️ Revela rutas internas
})
```

**Solución:**
```typescript
// Diferentes respuestas según ambiente
const isProduction = process.env.NODE_ENV === 'production'

const errorResponse: any = {
  statusCode: status,
  message: isProduction ? 'An error occurred' : message,
  timestamp: new Date().toISOString(),
}

// Solo en desarrollo incluir detalles
if (!isProduction) {
  errorResponse.error = error
  errorResponse.path = request.url
  errorResponse.stack = exception instanceof Error ? exception.stack : undefined
}

response.status(status).json(errorResponse)
```

---

### 8. **ALMACENAMIENTO DE TOKEN EN LOCALSTORAGE**
**Severidad:** MEDIA  
**Archivo:** `frontend/src/store/auth.ts`, `frontend/src/api/client.ts`

**Problema:**
- localStorage es vulnerable a XSS
- Tokens JWT accesibles desde JavaScript

**Alternativas más seguras:**
1. **httpOnly cookies** (más seguro)
2. **SessionStorage** (al menos se limpia al cerrar tab)
3. **Memory storage** (más seguro pero se pierde al refrescar)

**Solución recomendada:**
```typescript
// Backend: Enviar token en httpOnly cookie
@Post('login')
async login(@Body() loginDto: LoginDto, @Res() response: Response) {
  const result = await this.authService.login(loginDto)
  
  response.cookie('authToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict',
    maxAge: 3600000, // 1 hora
  })
  
  return response.json({ user: result.user })
}

// Frontend: No más localStorage
// El token se envía automáticamente en las cookies
```

---

## 📋 VULNERABILIDADES MEDIAS (Mejorar para mejor seguridad)

### 9. **FALTA DE RATE LIMITING**
**Severidad:** MEDIA

**Problema:**
- No hay protección contra fuerza bruta en login
- No hay límites de requests por IP

**Solución:**
```bash
npm install @nestjs/throttler
```

```typescript
// backend/src/app.module.ts
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos
      limit: 10, // 10 requests por minuto
    }]),
    // ... otros imports
  ],
})
```

---

### 10. **FALTA DE VALIDACIÓN EN FRONTEND**
**Severidad:** BAJA-MEDIA

**Problema:**
- Frontend confía en la respuesta del backend
- No hay validación de inputs en frontend

**Solución:**
- Agregar Zod o Yup para validación de formularios
- Sanitizar inputs antes de enviar

---

### 11. **DEPENDENCIAS DESACTUALIZADAS**

Revisar vulnerabilidades conocidas:
```bash
npm audit
npm audit fix
```

---

### 12. **FALTA HTTPS EN DESARROLLO**

**Problema:**
- Desarrollo en HTTP
- Cookies no configuradas como 'secure'

**Solución para desarrollo local:**
```bash
# Generar certificados self-signed
npm install -D mkcert

# O usar tunneling
npm install -g localtunnel
lt --port 3001
```

---

## 🎯 CHECKLIST ANTES DE DEPLOYMENT

### Pre-deployment (OBLIGATORIO)
- [ ] **Remover credenciales de Google del repositorio**
- [ ] **Agregar `backend/credentials/` a .gitignore**
- [ ] **Rotar credenciales de Google Service Account**
- [ ] **Generar JWT_SECRET fuerte (64 bytes random)**
- [ ] **Eliminar o proteger endpoint `/api/auth/debug/env`**
- [ ] **Remover usuarios mock hardcodeados**
- [ ] **Configurar base de datos real (PostgreSQL/Supabase)**
- [ ] **Configurar CORS_ORIGIN con dominio de producción**
- [ ] **Deshabilitar logs de debug en producción**
- [ ] **Configurar variables de entorno en Render**

### Configuración de Render
```bash
# Variables de entorno necesarias en Render:
NODE_ENV=production
PORT=3001  # Render lo asigna automáticamente
JWT_SECRET=<tu-secret-fuerte-de-64-bytes>
CORS_ORIGIN=https://tu-frontend.github.io
DATABASE_URL=<tu-url-de-postgres>
GOOGLE_APPLICATION_CREDENTIALS_JSON=<json-completo-de-credenciales>
# NO usar NODE_TLS_REJECT_UNAUTHORIZED en producción
```

### GitHub Pages (Frontend)
```bash
# Variables de entorno en GitHub Actions:
VITE_API_BASE_URL=https://tu-backend.onrender.com/api
```

### Seguridad adicional (RECOMENDADO)
- [ ] Implementar rate limiting
- [ ] Agregar helmet para headers de seguridad
- [ ] Configurar httpOnly cookies en lugar de localStorage
- [ ] Implementar refresh tokens
- [ ] Agregar validación de inputs robusta
- [ ] Implementar logging seguro (sin info sensible)
- [ ] Configurar HTTPS en frontend y backend
- [ ] Implementar CSP (Content Security Policy)
- [ ] Agregar pruebas de seguridad automatizadas

### Testing de seguridad
- [ ] Escanear con `npm audit`
- [ ] Revisar con OWASP ZAP o similar
- [ ] Hacer pruebas de penetración básicas
- [ ] Verificar que no haya secrets en el código

---

## 📚 RECURSOS ÚTILES

### Hosting seguro
- **Render:** Variables de entorno secretas, HTTPS automático
- **Railway:** Similar a Render
- **Vercel/Netlify:** Para frontend (HTTPS gratis)

### Gestión de secrets
- **Render Secrets:** Para variables de entorno
- **GitHub Secrets:** Para CI/CD
- **Doppler/Vault:** Para gestión avanzada de secrets

### Herramientas de seguridad
```bash
npm install helmet           # Security headers
npm install @nestjs/throttler  # Rate limiting
npm install express-rate-limit # Alternative rate limiter
npm install hpp              # HTTP Parameter Pollution protection
```

---

## ⚡ QUICK FIX SCRIPT

Ejecuta esto ANTES de pushear a GitHub:

```bash
#!/bin/bash

# 1. Actualizar .gitignore
cat >> .gitignore << EOF

# Credentials (CRÍTICO)
backend/credentials/
**/google-service-account.json
*.pem
*.key

# Environment files
.env
.env.local
.env.*.local
.env.production
EOF

# 2. Remover archivos sensibles del staging
git rm --cached backend/credentials/google-service-account.json 2>/dev/null || true

# 3. Verificar que no hay secrets
echo "Buscando posibles secrets en el código..."
grep -r "password.*=.*['\"]" backend/src/ --include="*.ts" || echo "✅ No passwords hardcoded"
grep -r "secret.*=.*['\"]" backend/src/ --include="*.ts" || echo "✅ No secrets hardcoded"

echo ""
echo "⚠️  RECUERDA:"
echo "1. Rotar credenciales de Google Cloud"
echo "2. Generar JWT_SECRET nuevo"
echo "3. Configurar variables de entorno en Render"
echo "4. Eliminar usuarios mock en producción"
```

---

## 📞 SOPORTE

Si necesitas ayuda con alguna de estas correcciones, documenta:
1. Qué intentaste hacer
2. Qué error obtuviste
3. Tu configuración actual de ambiente

---

**Última actualización:** 2026-07-04  
**Prioridad:** 🚨 CRÍTICO - NO DESPLEGAR HASTA RESOLVER SECCIONES CRÍTICAS
