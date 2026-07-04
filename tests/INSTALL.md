# 🚀 Instalación de Dependencias de Testing

## 📦 Backend Testing

```bash
cd backend
npm install --save-dev supertest @nestjs/testing
```

**Paquetes instalados:**
- `supertest`: Para tests de integración HTTP
- `@nestjs/testing`: Utilidades de testing de NestJS (ya debería estar)

## ⚛️ Frontend Testing

```bash
cd frontend
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Paquetes instalados:**
- `vitest`: Framework de testing (alternativa a Jest, integrado con Vite)
- `@vitest/ui`: Interfaz visual para tests
- `@testing-library/react`: Testing de componentes React
- `@testing-library/jest-dom`: Matchers custom para DOM
- `@testing-library/user-event`: Simulación de eventos de usuario
- `jsdom`: Entorno DOM para Node.js

## 🎭 E2E Testing (Playwright)

```bash
cd tests/e2e
npm install
npx playwright install
```

**Paquetes instalados:**
- `@playwright/test`: Framework E2E testing
- Navegadores: Chromium, Firefox, WebKit (se instalan con `playwright install`)

## ✅ Verificar Instalación

### Backend
```bash
cd backend
npm test -- --version
```

### Frontend
```bash
cd frontend
npx vitest --version
```

### E2E
```bash
cd tests/e2e
npx playwright --version
```

## 🔧 Scripts Agregados

### Frontend (package.json)
Agrega estos scripts a `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 🎯 Configuración Adicional

### Backend (.env.test)
Crea `backend/.env.test` con variables de testing:

```env
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
GOOGLE_SHEET_MOVEMENTS_NAME=TEST_Sheet
GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/test
```

### Frontend (.env.test)
Crea `frontend/.env.test`:

```env
VITE_API_URL=http://localhost:3001
```

## 📊 Ejecutar Tests

Una vez instalado todo:

```bash
# Ejecutar todos los tests
.\tests\scripts\run-all-tests.ps1

# O individualmente:
cd backend && npm test
cd frontend && npm test
cd tests/e2e && npx playwright test
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'supertest'"
```bash
cd backend
npm install --save-dev supertest
```

### Error: "vitest: command not found"
```bash
cd frontend
npm install --save-dev vitest
```

### Error: "Playwright browsers not installed"
```bash
cd tests/e2e
npx playwright install
```

### Error en tests E2E: "Cannot connect to backend"
Asegúrate de que backend y frontend están corriendo:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd tests/e2e && npx playwright test
```

## 📝 Notas

- Los tests E2E **escriben datos reales** en Google Sheets
- Usa una hoja de Google Sheets dedicada para testing
- Los tests pueden tardar varios minutos en completarse
- Playwright puede ejecutarse en modo headless (sin interfaz) o headed (con interfaz visible)
