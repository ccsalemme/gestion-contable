# 🚀 GUÍA DE DEPLOYMENT - Render + GitHub Pages

Esta guía te ayudará a desplegar tu aplicación de forma segura.

---

## 📋 PRE-REQUISITOS

### ✅ Checklist antes de empezar

Ejecuta el script de seguridad:
```powershell
.\security-check.ps1
```

Luego verifica manualmente:
- [ ] Has leído `SEGURIDAD-PREPRODUCCION.md` completamente
- [ ] Credenciales de Google NO están en el repositorio
- [ ] `.gitignore` protege archivos sensibles
- [ ] Tienes una cuenta en [Render.com](https://render.com)
- [ ] Tienes una cuenta en [GitHub](https://github.com)
- [ ] Tu código está en un repositorio de GitHub

---

## 🗄️ PARTE 1: Base de Datos PostgreSQL en Render

### Paso 1: Crear PostgreSQL Database

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "PostgreSQL"
3. Configuración:
   - **Name:** `plataforma-contable-db`
   - **Database:** `plataforma_contable`
   - **User:** (generado automáticamente)
   - **Region:** Oregon (US West) o el más cercano
   - **Plan:** Free (para pruebas)
4. Click "Create Database"
5. **GUARDA** la "Internal Database URL" (la usarás después)

---

## 🔧 PARTE 2: Backend en Render

### Paso 2: Preparar credenciales de Google

**ANTES de desplegar, necesitas convertir el archivo JSON a una variable de entorno:**

```powershell
# En PowerShell:
$json = Get-Content backend\credentials\google-service-account.json -Raw
$json = $json -replace '\s+', ' '  # Remover saltos de línea
Write-Host $json
# Copia el output
```

O manualmente:
1. Abre `backend/credentials/google-service-account.json`
2. Copia TODO el contenido
3. Minifica en una sola línea (puedes usar https://www.text-utils.com/json-formatter/)

### Paso 3: Generar JWT Secret

```bash
# En Git Bash o Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copia el resultado
```

### Paso 4: Crear Web Service para Backend

1. En Render Dashboard → "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** `plataforma-contable-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run prod`
   - **Plan:** Free

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

```bash
NODE_ENV=production

PORT=3001

# Database (copia la Internal Database URL de tu PostgreSQL)
DATABASE_URL=postgresql://...

# JWT (pega el secret que generaste)
JWT_SECRET=<tu-secret-de-64-bytes>
JWT_EXPIRATION=3600

# Google Credentials (pega el JSON completo en una línea)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account"...}

# CORS (reemplaza con tu dominio de GitHub Pages)
CORS_ORIGIN=https://TU-USUARIO.github.io

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Click "Create Web Service"
6. Espera a que termine el deploy (~5 minutos)
7. **GUARDA** la URL de tu servicio (ej: `https://plataforma-contable-backend.onrender.com`)

### Paso 5: Verificar Backend

Abre en el navegador:
```
https://tu-backend.onrender.com/api/docs
```

Deberías ver la documentación Swagger.

---

## 🎨 PARTE 3: Frontend en GitHub Pages

### Paso 6: Configurar GitHub Repository

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Agregar:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://tu-backend.onrender.com/api`

### Paso 7: Crear GitHub Action para Deploy

Crea el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        run: |
          cd frontend
          npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Paso 8: Habilitar GitHub Pages

1. **Settings** → **Pages**
2. **Source:** GitHub Actions
3. Click "Save"

### Paso 9: Trigger Deploy

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

Ve a la pestaña "Actions" en GitHub para ver el progreso.

### Paso 10: Verificar Frontend

Tu app estará disponible en:
```
https://TU-USUARIO.github.io
```

O si el repo no es tu página principal:
```
https://TU-USUARIO.github.io/NOMBRE-REPO
```

**IMPORTANTE:** Si usas subdirectorio, actualiza `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  base: '/NOMBRE-REPO/',  // Agrega esta línea
  // ... resto de config
})
```

Y vuelve a hacer push.

---

## 🔒 PARTE 4: Seguridad Post-Deployment

### Verificaciones de Seguridad

1. **Verificar CORS:**
   ```bash
   curl -H "Origin: https://evil.com" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://tu-backend.onrender.com/api/auth/login
   ```
   
   Deberías recibir un error de CORS.

2. **Verificar que las credenciales no están expuestas:**
   ```bash
   # Buscar en GitHub
   # Ve a tu repo → buscar "private_key"
   # NO debería encontrar nada
   ```

3. **Verificar autenticación:**
   ```bash
   # Sin token, debería fallar:
   curl https://tu-backend.onrender.com/api/users
   ```

### Monitoreo

1. **Render Dashboard:**
   - Revisa los logs en tiempo real
   - Configura alertas de errores

2. **GitHub Actions:**
   - Verifica que los deploys sean exitosos
   - Revisa logs de build

---

## 🐛 TROUBLESHOOTING

### Backend no inicia

**Problema:** Error de DATABASE_URL
```
Error: connect ECONNREFUSED
```

**Solución:**
- Verifica que la DATABASE_URL sea la "Internal" URL
- Asegúrate que el PostgreSQL está running en Render

---

### CORS Error en Frontend

**Problema:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
1. Verifica que CORS_ORIGIN en Render tenga tu URL de GitHub Pages EXACTA
2. Incluye https:// en la URL
3. NO uses trailing slash: `https://user.github.io` (sin `/` al final)

---

### Frontend muestra página en blanco

**Problema:** 404 en todas las rutas excepto `/`

**Solución para GitHub Pages:**

Crea `frontend/public/_redirects` (para Netlify) o `frontend/public/404.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script>
      // Redirect 404s to index.html for SPA routing
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'" />
  </head>
</html>
```

Y en `frontend/src/main.tsx`:

```typescript
// Handle SPA routing with GitHub Pages
const redirect = sessionStorage.redirect;
delete sessionStorage.redirect;
if (redirect && redirect !== location.href) {
  history.replaceState(null, '', redirect);
}
```

---

### Render Free Tier se duerme

**Problema:** Primera request tarda 30+ segundos

**Explicación:** Render Free Tier duerme los servicios inactivos después de 15 minutos.

**Soluciones:**
1. Upgrade a plan pago ($7/mes)
2. Usar servicio de "keep-alive" (ej: https://uptimerobot.com/)
3. Avisar a usuarios que la primera carga puede ser lenta

---

## 💰 COSTOS

### Render Free Tier
- ✅ **PostgreSQL:** 1 GB, expira en 90 días
- ✅ **Web Service:** 750 horas/mes, se duerme después de 15 min inactivo
- ❌ **Limitaciones:** 
  - No HTTPS automático en Free tier (actualizado: sí tiene HTTPS)
  - Se duerme cuando no se usa
  - Build time limitado

### Render Paid
- **PostgreSQL:** Desde $7/mes (256 MB RAM)
- **Web Service:** Desde $7/mes (512 MB RAM, siempre activo)

### GitHub Pages
- ✅ **Completamente gratis**
- ✅ HTTPS automático
- ❌ Solo para sitios estáticos
- ❌ 100 GB bandwidth/mes

---

## 🎯 PRÓXIMOS PASOS

Después del deployment exitoso:

1. **Configurar dominio custom** (opcional)
   - Render: Custom domain (~$1-15/año)
   - GitHub Pages: Soporta dominios custom gratis

2. **Implementar CI/CD completo**
   - Tests automáticos antes de deploy
   - Linting y type checking

3. **Agregar monitoring**
   - Sentry para error tracking
   - Google Analytics
   - Render metrics

4. **Mejorar seguridad**
   - Implementar rate limiting
   - Agregar refresh tokens
   - Configurar CSP headers

5. **Optimizaciones**
   - CDN para assets estáticos
   - Code splitting en frontend
   - Database indexes

---

## 📚 RECURSOS

- [Render Docs](https://render.com/docs)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [NestJS Production](https://docs.nestjs.com/techniques/production)

---

## 🆘 AYUDA

Si encuentras problemas:

1. Revisa los logs en Render Dashboard
2. Revisa los logs en GitHub Actions
3. Verifica variables de entorno
4. Consulta `SEGURIDAD-PREPRODUCCION.md`
5. Busca el error específico en Google/StackOverflow

---

**¡Éxito con tu deployment!** 🎉
