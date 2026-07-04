import { test, expect } from '@playwright/test';

test.describe('Registro de Movimientos', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/i);

    // Navegar a página de movimientos
    await page.getByRole('link', { name: /movimientos/i }).click();
    await expect(page.getByRole('heading', { name: /registro de operaciones/i })).toBeVisible();
  });

  test('debe registrar una operación de Solo Compra', async ({ page }) => {
    // Seleccionar tipo de operación
    await page.getByLabel('Solo Compra').check();

    // Llenar formulario
    await page.getByLabel(/monto/i).first().fill('1000');
    await page.getByLabel(/proveedor/i).fill('Proveedor Test E2E');
    await page.getByLabel(/costo/i).first().fill('1.015');
    await page.selectOption('select[id*="motivo"]', 'Cable');
    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    // Enviar formulario
    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar mensaje de éxito
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  test('debe registrar una operación de Solo Venta', async ({ page }) => {
    // Seleccionar tipo de operación
    await page.getByLabel('Solo Venta').check();

    // Llenar formulario
    await page.getByLabel(/monto/i).first().fill('1000');
    await page.getByLabel(/cliente/i).fill('Cliente Test E2E');
    await page.getByLabel(/costo/i).first().fill('1.02');
    await page.getByLabel(/utiliza saldo actual/i).check();
    await page.selectOption('select[id*="motivo"]', 'USDT');
    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    // Enviar formulario
    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar mensaje de éxito
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  test('debe registrar una operación Vinculada', async ({ page }) => {
    // Seleccionar tipo de operación
    await page.getByLabel('Compra y Venta Vinculadas').check();

    // Llenar sección de compra
    await page.locator('#compra\\.monto').fill('1000');
    await page.locator('#compra\\.contraparte').fill('Proveedor Vinculado E2E');
    await page.locator('#compra\\.costo').fill('1.015');

    // Llenar sección de venta
    await page.locator('#venta\\.monto').fill('1000');
    await page.locator('#venta\\.contraparte').fill('Cliente Vinculado E2E');
    await page.locator('#venta\\.costo').fill('1.02');

    // Motivo y estado
    await page.selectOption('select[id*="motivo"]', 'Cable');
    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    // Enviar formulario
    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar mensaje de éxito
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  test('debe registrar una Liquidación', async ({ page }) => {
    // Seleccionar Liquidación en motivo (auto-selecciona vinculadas)
    await page.selectOption('select[id*="motivo"]', 'Liquidación');

    // Verificar que se auto-seleccionó vinculadas
    await expect(page.getByLabel('Compra y Venta Vinculadas')).toBeChecked();

    // Llenar sección de compra
    await page.locator('#compra\\.monto').fill('5000');
    await page.locator('#compra\\.contraparte').fill('Vendedor Liquidación E2E');
    await page.locator('#compra\\.costo').fill('1.0');

    // Llenar sección de venta
    await page.locator('#venta\\.monto').fill('5000');
    await page.locator('#venta\\.contraparte').fill('Comprador Liquidación E2E');
    await page.locator('#venta\\.costo').fill('1.0');

    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    // Enviar formulario
    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar mensaje de éxito
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  test('debe mostrar campo personalizado para motivo Otro', async ({ page }) => {
    // Seleccionar motivo Otro
    await page.selectOption('select[id*="motivo"]', 'Otro');

    // Verificar que aparece el campo de texto
    await expect(page.getByPlaceholder(/ingrese el motivo/i)).toBeVisible();
  });

  test('debe ocultar checkbox de saldo actual en operación vinculada', async ({ page }) => {
    // Primero verificar que está visible en Solo Venta
    await page.getByLabel('Solo Venta').check();
    await expect(page.getByLabel(/utiliza saldo actual/i)).toBeVisible();

    // Cambiar a vinculadas
    await page.getByLabel('Compra y Venta Vinculadas').check();

    // Verificar que se oculta
    await expect(page.getByLabel(/utiliza saldo actual/i)).not.toBeVisible();
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Seleccionar Solo Compra
    await page.getByLabel('Solo Compra').check();

    // Intentar enviar sin llenar campos
    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar que aparecen mensajes de error
    await expect(page.getByText(/obligatorio/i).first()).toBeVisible();
  });

  test('debe validar que el costo sea mayor a 0', async ({ page }) => {
    // Seleccionar Solo Compra
    await page.getByLabel('Solo Compra').check();

    // Llenar con costo inválido
    await page.getByLabel(/monto/i).first().fill('1000');
    await page.getByLabel(/proveedor/i).fill('Test');
    await page.getByLabel(/costo/i).first().fill('0'); // Costo inválido

    // Intentar enviar
    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar mensaje de error
    await expect(page.getByText(/mayor a 0/i)).toBeVisible();
  });

  test('debe poder registrar múltiples operaciones consecutivas', async ({ page }) => {
    // Primera operación
    await page.getByLabel('Solo Compra').check();
    await page.getByLabel(/monto/i).first().fill('1000');
    await page.getByLabel(/proveedor/i).fill('Proveedor 1');
    await page.getByLabel(/costo/i).first().fill('1.015');
    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });

    // Esperar que se limpie el formulario
    await page.waitForTimeout(3000);

    // Segunda operación (tipo diferente)
    await page.getByLabel('Solo Venta').check();
    await page.getByLabel(/monto/i).first().fill('2000');
    await page.getByLabel(/cliente/i).fill('Cliente 1');
    await page.getByLabel(/costo/i).first().fill('1.02');
    await page.getByLabel(/utiliza saldo actual/i).check();
    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });
  });
});
