# ✅ CHECKLIST DE TESTING

Usa esta checklist para asegurarte de que todo funciona correctamente.

## 📦 1. INSTALACIÓN

- [ ] Dependencias backend instaladas
  ```powershell
  cd backend && npm test -- --version
  ```

- [ ] Dependencias frontend instaladas
  ```powershell
  cd frontend && npx vitest --version
  ```

- [ ] Playwright instalado
  ```powershell
  cd tests/e2e && npx playwright --version
  ```

**Si falta algo:**
```powershell
.\tests\scripts\install-dependencies.ps1
```

---

## 🧪 2. TESTS UNITARIOS BACKEND

- [ ] Tests de DTOs pasan
  - [ ] Solo Compra válido
  - [ ] Solo Venta válido
  - [ ] Compra y Venta Vinculadas válido
  - [ ] Liquidación válido
  - [ ] Validaciones de campos requeridos
  - [ ] Validaciones de rangos (monto > 0, costo > 0)

- [ ] Tests de servicios pasan
  - [ ] SheetsService inicializa correctamente
  - [ ] Configuración de Google Sheets

**Ejecutar:**
```powershell
cd backend && npm test
```

---

## 🔗 3. TESTS INTEGRACIÓN BACKEND

- [ ] POST /sheets/movements funciona
  - [ ] Con autenticación válida
  - [ ] Rechaza sin autenticación
  - [ ] Valida datos correctamente

- [ ] Crea correctamente:
  - [ ] Solo Compra
  - [ ] Solo Venta
  - [ ] Compra y Venta Vinculadas
  - [ ] Liquidación

**Ejecutar:**
```powershell
cd backend && npm run test:e2e
```

---

## ⚛️ 4. TESTS UNITARIOS FRONTEND

- [ ] MovementsPage renderiza correctamente
  
- [ ] Radio buttons funcionan:
  - [ ] Solo Compra muestra campos de compra
  - [ ] Solo Venta muestra campos de venta
  - [ ] Vinculadas muestra ambos

- [ ] Validaciones funcionan:
  - [ ] Campos requeridos
  - [ ] Costo > 0
  - [ ] No se puede enviar formulario vacío

- [ ] UX correcta:
  - [ ] Liquidación auto-selecciona vinculadas
  - [ ] Checkbox saldo actual oculto en vinculadas
  - [ ] Campo motivo personalizado aparece con "Otro"

- [ ] Formulario se limpia después de envío exitoso

**Ejecutar:**
```powershell
cd frontend && npm test
```

---

## 🎭 5. TESTS E2E COMPLETOS

### Auth Tests
- [ ] Página de login carga
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas rechaza
- [ ] Sesión persiste después de reload
- [ ] Logout funciona

### Movements Tests
- [ ] Registro Solo Compra funciona
- [ ] Registro Solo Venta funciona
- [ ] Registro Compra y Venta Vinculadas funciona
- [ ] Registro Liquidación funciona
- [ ] Campo motivo personalizado aparece con "Otro"
- [ ] Checkbox saldo actual oculto en vinculadas
- [ ] Validación de campos requeridos funciona
- [ ] Validación de costo > 0 funciona
- [ ] Múltiples operaciones consecutivas funcionan

### Full Flow Tests
- [ ] Flujo completo: Login → 4 operaciones → Logout
- [ ] Validación de errores funciona
- [ ] Datos se escriben correctamente en Google Sheets

**Ejecutar:**
```powershell
cd tests/e2e && npx playwright test
```

---

## 🚀 6. TEST RÁPIDO DE WEBHOOK

- [ ] Backend responde correctamente
- [ ] Webhook procesa formularios
- [ ] Google Apps Script responde
- [ ] 3 operaciones de prueba se crean:
  - [ ] Compra y Venta Vinculadas
  - [ ] Liquidación
  - [ ] Solo Compra

**Ejecutar:**
```powershell
.\tests\scripts\test-webhook.ps1
```

---

## 📊 7. COVERAGE

- [ ] Backend coverage > 80%
  ```powershell
  cd backend && npm run test:cov
  ```

- [ ] Frontend coverage > 70%
  ```powershell
  cd frontend && npm run test:coverage
  ```

---

## ✅ 8. EJECUCIÓN COMPLETA

- [ ] Todos los tests pasan sin errores
  ```powershell
  .\tests\scripts\run-all-tests.ps1
  ```

**Resultado esperado:**
```
✅ PASS - Backend Unit
✅ PASS - Backend Integration
✅ PASS - Frontend Unit
✅ PASS - E2E Full

🎉 TODOS LOS TESTS PASARON
```

---

## 🐛 9. DEBUGGING

Si algún test falla, usa estos comandos para investigar:

### Backend
```powershell
cd backend
npm run test:debug
```

### Frontend
```powershell
cd frontend
npm run test:ui
```

### E2E
```powershell
cd tests/e2e
npx playwright test --headed --debug
npx playwright show-report
```

---

## 📝 10. VERIFICACIÓN MANUAL

Después de que todos los tests pasen, verifica manualmente:

- [ ] Abre Google Sheets y verifica que:
  - [ ] Se crearon filas en FORM_INPUT con Estado="Pendiente"
  - [ ] Las filas se procesaron (Estado="Procesado")
  - [ ] Se escribieron en hojas de fecha (dd/MM)
  - [ ] Liquidaciones están en columnas J-M
  - [ ] Operaciones normales están en columnas A-G
  - [ ] Colores se aplicaron correctamente

- [ ] Abre la aplicación en el navegador:
  - [ ] Login funciona
  - [ ] Formulario de movimientos carga
  - [ ] Puedes registrar operaciones manualmente
  - [ ] No hay errores en consola

---

## 🎉 ¡COMPLETADO!

Si todos los items están marcados (✅), tu aplicación está completamente probada y funcionando correctamente.

### 📊 Resumen de Cobertura

| Componente | Tests | Estado |
|------------|-------|--------|
| Backend DTOs | ✅ | Completo |
| Backend Services | ✅ | Completo |
| Backend APIs | ✅ | Completo |
| Frontend Components | ✅ | Completo |
| Frontend Forms | ✅ | Completo |
| E2E Auth | ✅ | Completo |
| E2E Movements | ✅ | Completo |
| E2E Full Flow | ✅ | Completo |
| Google Sheets Integration | ✅ | Completo |

### 🚀 Próximos Pasos

1. **Integración Continua (CI/CD)**
   - Configurar GitHub Actions para ejecutar tests automáticamente
   - Ver: `.github/workflows/tests.yml` (próximamente)

2. **Tests de Performance**
   - Medir tiempos de respuesta
   - Stress testing con múltiples usuarios

3. **Tests de Seguridad**
   - Penetration testing
   - Validación de autenticación y autorización

---

📝 **Última actualización:** 2026-07-04
✅ **Estado:** Suite de testing completa y funcional
