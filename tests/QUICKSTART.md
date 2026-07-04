# 🚀 GUÍA RÁPIDA - Testing Automático

## ⚡ Instalación Rápida (5 minutos)

```powershell
# 1. Instalar dependencias backend
cd backend
npm install --save-dev supertest

# 2. Instalar dependencias frontend
cd ../frontend
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 3. Instalar Playwright para E2E
cd ../tests/e2e
npm install
npx playwright install chromium

cd ../..
```

## 🎯 Ejecutar Todos los Tests

```powershell
.\tests\scripts\run-all-tests.ps1
```

Esto ejecutará:
- ✅ Tests unitarios backend
- ✅ Tests integración backend
- ✅ Tests unitarios frontend
- ✅ Tests E2E completos

## 🔧 Ejecutar Tests Individuales

### Backend
```powershell
cd backend
npm test
```

### Frontend
```powershell
cd frontend
npm test
```

### E2E (Playwright)
```powershell
cd tests/e2e
npx playwright test
```

### Script Rápido (Webhook)
```powershell
.\tests\scripts\test-webhook.ps1
```

## 📊 Visualización de Tests

### Frontend (Interfaz Visual)
```powershell
cd frontend
npm run test:ui
```

### E2E (Modo Visible)
```powershell
cd tests/e2e
npx playwright test --headed
```

### Ver Reporte HTML E2E
```powershell
cd tests/e2e
npx playwright show-report
```

## 🐛 Debug de Tests

### Backend (Debug)
```powershell
cd backend
npm run test:debug
```

### E2E (Debug Mode)
```powershell
cd tests/e2e
npx playwright test --debug
```

## 📋 Qué Prueba Cada Test

### ✅ Backend Unit (Rápido: ~5s)
- Validación de DTOs
- Lógica de servicios
- Transformaciones de datos

### ✅ Backend Integration (Medio: ~30s)
- Endpoints completos con auth
- Validación request/response
- Integración con Google Sheets API

### ✅ Frontend Unit (Rápido: ~10s)
- Renderizado de componentes
- Validación de formularios
- Lógica de UI

### ✅ E2E Full (Lento: ~2min)
- Flujo completo: Login → Operación → Verificación
- Prueba de los 3 tipos de operaciones
- Validación de errores
- **⚠️ ESCRIBE EN GOOGLE SHEETS REAL**

## ⚠️ IMPORTANTE

**Los tests E2E SÍ modifican Google Sheets:**
- Crean filas en FORM_INPUT
- Activan el webhook real
- Escriben en hojas de fecha

**Recomendación:** Usa una hoja de Google Sheets de testing separada.

## 🎯 Ejemplo de Uso Típico

### Desarrollo normal (test rápido)
```powershell
.\tests\scripts\test-webhook.ps1
```

### Antes de commit (tests completos)
```powershell
.\tests\scripts\run-all-tests.ps1
```

### Investigar bug específico
```powershell
cd tests/e2e
npx playwright test --debug
```

## 📝 Archivos Principales

```
tests/
├── README.md                    ← Documentación completa
├── INSTALL.md                   ← Instalación detallada
├── QUICKSTART.md               ← Esta guía
├── backend/
│   ├── unit/                    ← Tests unitarios backend
│   └── integration/             ← Tests integración backend
├── frontend/
│   └── unit/                    ← Tests unitarios frontend
├── e2e/
│   ├── specs/                   ← Tests E2E (Playwright)
│   └── playwright.config.ts     ← Configuración Playwright
└── scripts/
    ├── run-all-tests.ps1        ← Ejecutar todo
    └── test-webhook.ps1         ← Test rápido
```

## 🆘 Problemas Comunes

### Error: "vitest: command not found"
```powershell
cd frontend
npm install --save-dev vitest
```

### Error: "Playwright browsers not installed"
```powershell
cd tests/e2e
npx playwright install
```

### Error: "Cannot connect to backend" (E2E)
Asegúrate de que backend y frontend están corriendo:
```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Tests E2E muy lentos
Normal. Los tests E2E pueden tardar 2-3 minutos porque:
- Esperan que backend/frontend inicien
- Ejecutan flujos completos
- Esperan respuestas de Google Sheets

## 💡 Tips

1. **Desarrollo rápido**: Usa `npm test` en backend/frontend
2. **Verificación completa**: Usa `run-all-tests.ps1` antes de commits
3. **Debug visual**: Usa `--headed` y `--debug` en Playwright
4. **Coverage**: Usa `npm run test:coverage` para ver cobertura

## 📚 Más Info

- **Documentación completa**: `tests/README.md`
- **Instalación paso a paso**: `tests/INSTALL.md`
- **Tests escritos**: Ver archivos `.spec.ts` y `.test.tsx`
