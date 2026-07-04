# 🚨 ACCIÓN INMEDIATA REQUERIDA

## ⚠️ PROBLEMA CRÍTICO DETECTADO

Las credenciales de Google **YA ESTÁN EN EL HISTORIAL DE GIT**.

Esto significa que aunque las elimines ahora, quedan en el historial del repositorio.
Si has hecho push a GitHub, están públicas.

---

## 🔧 SOLUCIÓN: Limpieza del Historial de Git

### Opción 1: BFG Repo-Cleaner (RECOMENDADO - Más Rápido)

```powershell
# 1. Instalar BFG (requiere Java)
# Descargar de: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Hacer backup del repo
cd ..
Copy-Item -Recurse "Plataforma-de-gestion-contable-multiempresa" "Plataforma-BACKUP-$(Get-Date -Format 'yyyy-MM-dd')"

# 3. Ejecutar BFG para eliminar el archivo del historial
cd Plataforma-de-gestion-contable-multiempresa
java -jar path\to\bfg.jar --delete-files google-service-account.json

# 4. Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (CUIDADO: solo si sabes lo que haces)
git push origin --force --all
```

### Opción 2: git filter-repo (Alternativa Moderna)

```powershell
# 1. Instalar git-filter-repo
pip install git-filter-repo

# 2. Hacer backup
cd ..
Copy-Item -Recurse "Plataforma-de-gestion-contable-multiempresa" "Plataforma-BACKUP-$(Get-Date -Format 'yyyy-MM-dd')"

# 3. Ejecutar limpieza
cd Plataforma-de-gestion-contable-multiempresa
git filter-repo --path backend/credentials/google-service-account.json --invert-paths

# 4. Force push
git push origin --force --all
```

### Opción 3: Empezar de Nuevo (MÁS SIMPLE)

Si el repositorio no tiene mucho historial importante:

```powershell
# 1. Hacer backup del código actual
cd ..
Copy-Item -Recurse "Plataforma-de-gestion-contable-multiempresa" "Plataforma-BACKUP"

# 2. Remover carpeta .git
cd Plataforma-de-gestion-contable-multiempresa
Remove-Item -Recurse -Force .git

# 3. Crear nuevo repositorio limpio
git init
git add .
git commit -m "Initial commit - clean version"

# 4. Si tenías un repo remoto, crear uno NUEVO en GitHub
# NO uses el mismo repo anterior
git remote add origin https://github.com/tu-usuario/nuevo-repo.git
git push -u origin main
```

---

## 🔑 ROTAR CREDENCIALES DE GOOGLE CLOUD

**CRÍTICO:** Después de limpiar el historial, DEBES rotar las credenciales:

### Paso 1: Eliminar Service Account Comprometida

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a: **IAM & Admin** → **Service Accounts**
3. Encuentra la cuenta: `python-backend@gen-lang-client-0437913768.iam.gserviceaccount.com`
4. Click en los 3 puntos (⋮) → **Delete**
5. Confirma la eliminación

### Paso 2: Crear Nueva Service Account

```bash
# En Google Cloud Console:

# 1. IAM & Admin → Service Accounts → Create Service Account
#    Name: "contable-backend-production"
#    ID: contable-backend-prod

# 2. Grant roles:
#    - Google Sheets API: Editor
#    - Google Drive API: Viewer

# 3. Click "Create Key" → JSON
#    Descarga el archivo nuevo

# 4. Guárdalo SOLO localmente en:
#    backend/credentials/google-service-account.json
#    (que ya está en .gitignore)
```

### Paso 3: Actualizar accesos a Google Sheets

Si tus Google Sheets tienen permisos para la service account antigua:

1. Abre cada Google Sheet que usa la app
2. Click en **Share**
3. Remover el email antiguo: `python-backend@gen-lang-client-0437913768.iam.gserviceaccount.com`
4. Agregar el nuevo email de la service account
5. Dar permisos de **Editor**

---

## 📝 JWT_SECRET GENERADO

He generado un JWT_SECRET fuerte para ti:

```
58208c6fe972bcb4e2e1e9d62667d4b1f3f7eb7e1d85d67644fcb3d211f1093430590def2b5de227
54710f568bfc95f48208cfb38266415f3a0bebedb196ae3f
```

**Cómo usar:**

### Para desarrollo local:

Actualiza `backend/.env`:
```bash
JWT_SECRET=58208c6fe972bcb4e2e1e9d62667d4b1f3f7eb7e1d85d67644fcb3d211f10934
```

### Para producción en Render:

1. Ve a tu servicio en Render Dashboard
2. **Environment** → **Add Environment Variable**
3. Name: `JWT_SECRET`
4. Value: `58208c6fe972bcb4e2e1e9d62667d4b1f3f7eb7e1d85d67644fcb3d211f10934`
5. Marca como **Secret** ✅
6. Click **Save Changes**

---

## ✅ VERIFICACIÓN FINAL

Después de hacer la limpieza y rotación:

```powershell
# 1. Verificar que el archivo no está en Git
git log --all --full-history -- "backend/credentials/google-service-account.json"
# Debe estar vacío o no mostrar nada

# 2. Verificar que está en .gitignore
cat .gitignore | Select-String "credentials"
# Debe mostrar "backend/credentials/"

# 3. Verificar archivos staged
git status
# NO debe aparecer google-service-account.json

# 4. Escanear por secrets en el código
git grep -i "private_key"
git grep -i "BEGIN PRIVATE KEY"
# NO debe encontrar nada
```

---

## 📊 CHECKLIST

- [ ] **Backup del repositorio hecho**
- [ ] **Limpieza del historial de Git completada**
- [ ] **Force push al repositorio remoto (si aplicable)**
- [ ] **Service Account antigua eliminada en Google Cloud**
- [ ] **Nueva Service Account creada**
- [ ] **Nuevas credenciales descargadas y guardadas SOLO localmente**
- [ ] **Permisos de Google Sheets actualizados**
- [ ] **JWT_SECRET actualizado en .env local**
- [ ] **Verificación final ejecutada**

---

## ⏱️ TIEMPO ESTIMADO

- Limpieza de Git: 10-15 minutos
- Rotación de credenciales: 15-20 minutos
- Verificación: 5 minutos

**TOTAL: ~30-40 minutos**

---

## 🆘 ¿NECESITAS AYUDA?

Si tienes problemas con algún paso, avísame y te ayudo a resolverlo.

**NO CONTINÚES CON EL DEPLOYMENT** hasta completar estos pasos.
