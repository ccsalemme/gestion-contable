# 🔍 GUÍA DE DIAGNÓSTICO - WEBHOOK GOOGLE APPS SCRIPT

## 📋 PREPARACIÓN

### 1. Reiniciar el Backend con Logs Mejorados

```powershell
# Detener el backend actual (Ctrl+C si está corriendo)
# Luego iniciar de nuevo:
cd c:\Users\L66760\UADE\Plataforma-de-gestion-contable-multiempresa
npm.cmd run dev
```

**✅ Verifica:** Que el backend compile sin errores y veas:
```
[Nest] INFO [NestApplication] Nest application successfully started
```

---

## 🧪 PRUEBAS PROGRESIVAS

### PRUEBA 1: Test Manual del Webhook (SIN NECESITAR APPS SCRIPT)

Este test llama directamente al webhook desde el backend.

```powershell
# Ejecutar el script de diagnóstico
.\test-webhook.ps1
```

**📊 Qué buscar en los logs del backend:**

#### ✅ Si funciona correctamente:
```
========================================
🚀 TRIGGERING GOOGLE APPS SCRIPT WEB APP
📍 URL: https://script.google.com/macros/s/...
📦 Payload: { trigger: "formSubmitted" }
========================================
✅ WEB APP RESPONSE SUCCESS
⏱️  Duration: 1234ms
📊 Status: 200
📄 Response: {
  "status": "success",
  "message": "Formularios procesados correctamente"
}
========================================
```

#### ❌ Si falla (Errores comunes):

**Error 1: "connect ETIMEDOUT"**
```
❌ WEB APP CALL FAILED
Error message: connect ETIMEDOUT
Error code: ETIMEDOUT
```
**→ Solución:** Tu red corporativa está bloqueando la conexión. Necesitas:
- Usar otra red (ej: hotspot de celular)
- O configurar un proxy
- O pedir a IT que permita el acceso

**Error 2: "URL no configurada o incorrecta"**
```
❌ WEB APP CALL FAILED
Status: 404
```
**→ Solución:** La URL del Web App es incorrecta. Verifica el .env

**Error 3: "403 Forbidden"**
```
❌ WEB APP CALL FAILED
Status: 403
```
**→ Solución:** El Web App no está publicado como "Cualquier persona"

---

### PRUEBA 2: Crear Operación desde el Formulario

Si el Test Manual funcionó (✅), ahora prueba desde el formulario:

1. **Abre el formulario:** http://localhost:5173/movements
2. **Crea una operación simple:**
   - Tipo: Solo Compra
   - Monto: 1234
   - Proveedor: Test WebApp
   - Costo: 1.01
   - Estado: Completada
3. **Click en "Registrar Operación"**
4. **Inmediatamente mira los logs del backend**

**📊 Qué buscar:**

```
[SheetsController] Creating new financial movement
[SheetsController] Type: Solo Compra, Currency: USD
========================================
🚀 TRIGGERING GOOGLE APPS SCRIPT WEB APP
[... resto de logs del webhook ...]
========================================
```

---

### PRUEBA 3: Verificar en Google Sheets

1. **Abre:** "Copia de Gyc (David) - Alex Finan"
2. **Ve a la hoja:** FORM_INPUT
3. **Busca las últimas filas:**
   - ¿Ves "Test Diagnostico" o "Test WebApp"?
   - **Columna K** debe decir **"Pendiente"** (no vacío, no "")
   - Si dice "Procesado", ¡el sistema funciona! 🎉

4. **Ve a la hoja del día actual:** (ej: "26/06" o "02/07")
   - ¿Aparecen los datos procesados?
   - ¿Tienen los colores correctos?

---

## 🔍 INTERPRETACIÓN DE RESULTADOS

### Caso A: El webhook se llama pero falla (❌)

**Logs del backend:**
```
❌ WEB APP CALL FAILED
Error code: ETIMEDOUT / ENOTFOUND / etc.
```

**Problema:** Conexión de red bloqueada
**Solución:** Cambiar de red o configurar proxy

---

### Caso B: El webhook funciona (✅) pero las filas no se procesan

**Logs del backend:**
```
✅ WEB APP RESPONSE SUCCESS
Response: { "status": "success", ... }
```

**PERO en Google Sheets:**
- Las filas siguen con estado "Pendiente"
- No aparecen datos en la hoja del día

**Problema:** El código del Apps Script tiene un error
**Solución:** Necesitas que alguien acceda al Apps Script y vea los logs de ejecución

---

### Caso C: Todo funciona pero con delay

**Síntoma:** Las operaciones se procesan, pero después de 1-2 minutos

**Causa:** El trigger `onChange` tiene un delay natural de Google
**Solución:** Normal, es el comportamiento esperado de Google Sheets

---

## 🛠️ SOLUCIONES ALTERNATIVAS

### Si NO puedes acceder a Apps Script:

**Opción 1: Pedir ayuda a alguien**
Pide a alguien que pueda acceder a:
1. https://script.google.com
2. Abrir tu proyecto "Copia de Gyc (David) - Alex Finan"
3. Ir a Extensiones → Apps Script
4. Hacer click en "Ejecuciones" (reloj ⏰)
5. Ver si hay errores

**Opción 2: Compartir acceso temporal**
Puedes darle acceso de "Editor" a alguien de confianza al spreadsheet:
1. Archivo → Compartir
2. Agregar el email de la persona
3. Rol: Editor
4. Esa persona puede ver los logs de Apps Script

---

## 📝 INFORMACIÓN PARA ENVIÁRME

Si el problema persiste, envíame:

1. **Logs del backend** cuando ejecutes `.\test-webhook.ps1`
   ```
   Copia toda la sección desde:
   🚀 TRIGGERING GOOGLE APPS SCRIPT WEB APP
   hasta
   ========================================
   ```

2. **Estado en FORM_INPUT:**
   - Screenshot de las últimas 5 filas
   - O descripción: "Columna K tiene valores: [...]"

3. **URL del Web App** (del archivo .env)
   ```
   GOOGLE_APPS_SCRIPT_WEB_APP_URL=...
   ```

4. **¿Puedes acceder a script.google.com desde otro dispositivo/red?**

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de pedir ayuda, verifica:

- [ ] El backend está corriendo sin errores
- [ ] Ejecutaste `.\test-webhook.ps1` y viste los resultados
- [ ] Revisaste los logs del backend (líneas con 🚀 y ✅/❌)
- [ ] Verificaste FORM_INPUT en Google Sheets
- [ ] La columna K tiene "Pendiente" (no está vacía)
- [ ] El Web App está publicado con "Encabezado" y "Cualquier persona"
- [ ] Probaste desde otra red (si es posible)

---

## 🚀 SIGUIENTE PASO

**Ejecuta el diagnóstico ahora:**

```powershell
.\test-webhook.ps1
```

Y envíame los resultados.
