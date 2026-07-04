# 🧪 SUITE DE TESTS AUTOMÁTICOS - GUÍA COMPLETA

¡Bienvenido a la suite de testing automática de la Plataforma de Gestión Contable!

## 🚀 INICIO RÁPIDO (3 Pasos)

### 1️⃣ Instalar Dependencias
```powershell
.\tests\scripts\install-dependencies.ps1
```
⏱️ **Tiempo:** ~5 minutos

### 2️⃣ Ejecutar Todos los Tests
```powershell
.\tests\scripts\run-all-tests.ps1
```
⏱️ **Tiempo:** ~3 minutos

### 3️⃣ Ver Resultados
Los tests te mostrarán:
- ✅ PASS - Todo funcionando
- ❌ FAIL - Hay un problema

## 📚 DOCUMENTACIÓN

### 📖 Guías Disponibles

| Archivo | Descripción | Para Quién |
|---------|-------------|------------|
| [QUICKSTART.md](QUICKSTART.md) | Guía rápida y comandos esenciales | 👉 **EMPIEZA AQUÍ** |
| [README.md](README.md) | Documentación completa del sistema | Lectura completa |
| [INSTALL.md](INSTALL.md) | Instalación paso a paso detallada | Si tienes problemas |

## 🎯 QUÉ TESTS TENEMOS

### ✅ 1. Tests Unitarios Backend (Jest)
📁 `tests/backend/unit/`
- Validación de DTOs (movement.dto.spec.ts)
- Lógica de servicios (sheets.service.spec.ts)

**Ejecutar:**
```powershell
cd backend && npm test
```

### ✅ 2. Tests de Integración Backend (Jest + Supertest)
📁 `tests/backend/integration/`
- Endpoints completos con autenticación
- Validación de APIs
- Integración con Google Sheets

**Ejecutar:**
```powershell
cd backend && npm run test:e2e
```

### ✅ 3. Tests Unitarios Frontend (Vitest)
📁 `tests/frontend/unit/`
- Renderizado de componentes
- Validación de formularios (MovementsPage.test.tsx)
- Lógica de UI

**Ejecutar:**
```powershell
cd frontend && npm test
```

### ✅ 4. Tests E2E Completos (Playwright)
📁 `tests/e2e/specs/`
- `auth.spec.ts` - Login, logout, sesión
- `movements.spec.ts` - Registro de operaciones
- `full-flow.spec.ts` - Flujo completo de usuario

**Ejecutar:**
```powershell
cd tests/e2e && npx playwright test
```

**⚠️ IMPORTANTE:** Los tests E2E escriben en Google Sheets real.

### ✅ 5. Script de Validación Rápida (PowerShell)
📁 `tests/scripts/test-webhook.ps1`
- Test rápido de webhook
- Valida 3 operaciones básicas

**Ejecutar:**
```powershell
.\tests\scripts\test-webhook.ps1
```

## 🔧 COMANDOS ESENCIALES

### Ejecutar Todo
```powershell
.\tests\scripts\run-all-tests.ps1
```

### Ejecutar con Interfaz Visual
```powershell
# Frontend (Vitest UI)
cd frontend && npm run test:ui

# E2E (Playwright UI)
cd tests/e2e && npx playwright test --ui
```

### Modo Debug
```powershell
# Backend
cd backend && npm run test:debug

# E2E (modo visual + pausa)
cd tests/e2e && npx playwright test --debug
```

### Ver Coverage
```powershell
# Backend
cd backend && npm run test:cov

# Frontend
cd frontend && npm run test:coverage
```

## 📊 ESTRUCTURA DE CARPETAS

```
tests/
├── 📄 QUICKSTART.md              ← Guía rápida (EMPIEZA AQUÍ)
├── 📄 README.md                   ← Documentación completa
├── 📄 INSTALL.md                  ← Instalación detallada
├── 📄 INDEX.md                    ← Este archivo
│
├── 📁 backend/
│   ├── unit/                      ← Tests unitarios backend
│   │   ├── sheets.service.spec.ts
│   │   └── movement.dto.spec.ts
│   └── integration/               ← Tests integración backend
│       └── sheets.integration.spec.ts
│
├── 📁 frontend/
│   └── unit/                      ← Tests unitarios frontend
│       └── MovementsPage.test.tsx
│
├── 📁 e2e/
│   ├── specs/                     ← Tests E2E (Playwright)
│   │   ├── auth.spec.ts
│   │   ├── movements.spec.ts
│   │   └── full-flow.spec.ts
│   ├── playwright.config.ts       ← Configuración Playwright
│   └── package.json
│
└── 📁 scripts/
    ├── run-all-tests.ps1          ← Ejecutar todos los tests
    ├── install-dependencies.ps1   ← Instalar dependencias
    └── test-webhook.ps1           ← Test rápido de webhook
```

## 🎯 FLUJOS DE TRABAJO

### 🔹 Desarrollo Normal
Cuando estás programando y quieres validar rápido:
```powershell
.\tests\scripts\test-webhook.ps1
```

### 🔹 Antes de Commit
Validar que todo funciona antes de hacer commit:
```powershell
.\tests\scripts\run-all-tests.ps1
```

### 🔹 Debuggear un Bug
Investigar un problema específico:
```powershell
cd tests/e2e
npx playwright test --headed --debug
```

### 🔹 Ver Coverage
Verificar qué código está probado:
```powershell
cd backend && npm run test:cov
cd frontend && npm run test:coverage
```

## ⚠️ NOTAS IMPORTANTES

### ✅ Tests Seguros (No Modifican Datos)
- Tests unitarios backend
- Tests unitarios frontend
- Tests de integración (con mocks)

### ⚠️ Tests que Modifican Google Sheets
- Tests E2E completos (Playwright)
- Script test-webhook.ps1

**Recomendación:** Usa una hoja de Google Sheets dedicada para testing.

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module"
```powershell
.\tests\scripts\install-dependencies.ps1
```

### Tests E2E fallan: "Cannot connect"
Verifica que backend y frontend están corriendo:
```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd tests/e2e && npx playwright test
```

### Tests muy lentos
Es normal. Los tests E2E pueden tardar 2-3 minutos porque:
- Inician backend y frontend automáticamente
- Esperan respuestas de Google Sheets
- Ejecutan flujos completos

## 📈 COVERAGE ESPERADO

| Nivel | Coverage Objetivo | Estado |
|-------|-------------------|--------|
| Backend | >80% | 🟡 En progreso |
| Frontend | >70% | 🟡 En progreso |
| E2E | Flujos críticos | ✅ Completo |

## 🎓 APRENDER MÁS

### Herramientas Utilizadas

- **Jest**: Framework de testing para Node.js/NestJS
  - [Documentación](https://jestjs.io/)
  
- **Vitest**: Framework de testing para Vite/React
  - [Documentación](https://vitest.dev/)
  
- **Testing Library**: Testing de componentes React
  - [Documentación](https://testing-library.com/)
  
- **Playwright**: Testing E2E automatizado
  - [Documentación](https://playwright.dev/)

### Ejemplos de Tests

Cada archivo `.spec.ts` y `.test.tsx` tiene ejemplos de cómo escribir tests. Úsalos como referencia para crear nuevos tests.

## 🆘 AYUDA

### Si algo no funciona:

1. **Revisa** [QUICKSTART.md](QUICKSTART.md) - Comandos básicos
2. **Lee** [INSTALL.md](INSTALL.md) - Instalación paso a paso
3. **Consulta** [README.md](README.md) - Documentación completa

### Verificar que todo está instalado:

```powershell
# Backend
cd backend && npm test -- --version

# Frontend
cd frontend && npx vitest --version

# E2E
cd tests/e2e && npx playwright --version
```

## 🎉 ¡LISTO!

Ya tienes una suite de testing automática completa. Ahora puedes:

1. ✅ Detectar errores automáticamente
2. ✅ Validar toda la aplicación de principio a fin
3. ✅ Debuggear problemas fácilmente
4. ✅ Asegurar calidad del código

**Ejecuta tu primer test ahora:**
```powershell
.\tests\scripts\test-webhook.ps1
```

---

📝 **Última actualización:** 2026-07-04
🔧 **Versión:** 1.0.0
