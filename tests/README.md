# 🧪 Suite de Tests - Plataforma de Gestión Contable

## 📂 Estructura de Tests

```
tests/
├── backend/           # Tests del backend (Jest)
│   ├── unit/          # Tests unitarios de servicios
│   ├── integration/   # Tests de integración de APIs
│   └── e2e/           # Tests end-to-end del backend
├── frontend/          # Tests del frontend (Vitest)
│   ├── unit/          # Tests unitarios de componentes
│   └── integration/   # Tests de integración de páginas
├── e2e/               # Tests end-to-end completos (Playwright)
│   ├── auth.spec.ts
│   ├── movements.spec.ts
│   └── full-flow.spec.ts
└── scripts/           # Scripts de testing rápido
    └── test-webhook.ps1
```

## 🚀 Comandos de Testing

### Backend
```bash
cd backend
npm test                    # Ejecutar todos los tests
npm run test:watch          # Modo watch
npm run test:cov            # Con coverage
npm run test:e2e            # Solo E2E backend
```

### Frontend
```bash
cd frontend
npm test                    # Ejecutar todos los tests
npm run test:ui             # Interfaz visual de tests
npm run test:coverage       # Con coverage
```

### E2E Completo (Playwright)
```bash
cd tests/e2e
npx playwright test                    # Todos los tests
npx playwright test --headed           # Con interfaz visible
npx playwright test --debug            # Modo debug
npx playwright show-report             # Ver reporte HTML
```

### Script Rápido
```powershell
.\tests\scripts\test-webhook.ps1       # Test rápido de webhook
```

## 📋 Qué Prueba Cada Nivel

### 1️⃣ Tests Unitarios Backend
- ✓ Validación de DTOs
- ✓ Lógica de servicios (SheetsService, AuthService)
- ✓ Transformación de datos
- ✓ Cálculos y operaciones

### 2️⃣ Tests Integración Backend
- ✓ Endpoints completos con autenticación
- ✓ Validación de request/response
- ✓ Manejo de errores
- ✓ Integración con Google Sheets API

### 3️⃣ Tests Unitarios Frontend
- ✓ Renderizado de componentes
- ✓ Validación de formularios
- ✓ Manejo de estados (Zustand)
- ✓ Lógica de UI

### 4️⃣ Tests E2E Completos
- ✓ Flujo completo: Login → Registro operación → Verificación
- ✓ Prueba de los 3 tipos de operaciones
- ✓ Validación de errores de usuario
- ✓ Interacción con Google Sheets real

### 5️⃣ Script Rápido
- ✓ Validación rápida de webhook
- ✓ Test de 3 operaciones básicas
- ✓ Sin setup complejo

## 🎯 Ejecución de Tests Completa

### Opción 1: Tests Individuales
```bash
# 1. Backend
cd backend && npm test

# 2. Frontend
cd frontend && npm test

# 3. E2E
cd tests/e2e && npx playwright test
```

### Opción 2: Script Completo (PowerShell)
```powershell
.\tests\run-all-tests.ps1
```

## 📊 Coverage Esperado

- **Backend**: >80% coverage
- **Frontend**: >70% coverage
- **E2E**: Todos los flujos críticos cubiertos

## 🔧 Configuración Inicial

1. **Instalar dependencias de testing:**
```bash
cd backend
npm install --save-dev supertest @nestjs/testing

cd ../frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

cd ../tests/e2e
npm install --save-dev @playwright/test
npx playwright install
```

2. **Configurar variables de entorno:**
- Tests usan `.env.test` en backend/frontend
- E2E usa configuración en `playwright.config.ts`

## ⚠️ Nota Importante

Los tests E2E **SÍ tienen consecuencias** en Google Sheets:
- Crean hojas de prueba con prefijo `TEST_`
- Escriben datos reales en FORM_INPUT
- Se pueden limpiar con script de cleanup

Para evitar contaminar datos reales, usa una hoja de Google Sheets de testing.
