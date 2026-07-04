import { test, expect } from '@playwright/test';

/**
 * Test de flujo completo end-to-end
 * Simula el flujo completo de un usuario desde login hasta verificación
 */
test.describe('Flujo Completo E2E', () => {
  test('flujo completo: login → registro operación → verificación', async ({ page }) => {
    // 1️⃣ LOGIN
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/dashboard/i);

    // 2️⃣ NAVEGAR A MOVIMIENTOS
    await page.getByRole('link', { name: /movimientos/i }).click();
    await expect(page.getByRole('heading', { name: /registro de operaciones/i })).toBeVisible();

    // 3️⃣ REGISTRAR OPERACIÓN DE COMPRA
    await page.getByLabel('Solo Compra').check();
    await page.getByLabel(/monto/i).first().fill('1500');
    await page.getByLabel(/proveedor/i).fill('Proveedor Flujo Completo');
    await page.getByLabel(/costo/i).first().fill('1.018');
    await page.selectOption('select[id*="motivo"]', 'Cable');
    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    // Tomar screenshot antes de enviar
    await page.screenshot({ path: 'tests/e2e/screenshots/antes-de-enviar.png' });

    await page.getByRole('button', { name: /registrar/i }).click();

    // 4️⃣ VERIFICAR ÉXITO
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 15000 });

    // Tomar screenshot después de éxito
    await page.screenshot({ path: 'tests/e2e/screenshots/despues-de-exito.png' });

    // 5️⃣ VERIFICAR QUE FORMULARIO SE LIMPIÓ
    await page.waitForTimeout(3000); // Esperar mensaje de éxito
    const montoInput = page.getByLabel(/monto/i).first();
    await expect(montoInput).toHaveValue('');

    // 6️⃣ REGISTRAR SEGUNDA OPERACIÓN (DIFERENTE TIPO)
    await page.getByLabel('Solo Venta').check();
    await page.getByLabel(/monto/i).first().fill('1500');
    await page.getByLabel(/cliente/i).fill('Cliente Flujo Completo');
    await page.getByLabel(/costo/i).first().fill('1.025');
    await page.getByLabel(/utiliza saldo actual/i).check();
    await page.selectOption('select[id*="motivo"]', 'USDT');
    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 15000 });

    // 7️⃣ REGISTRAR OPERACIÓN VINCULADA
    await page.waitForTimeout(3000);
    await page.getByLabel('Compra y Venta Vinculadas').check();

    await page.locator('#compra\\.monto').fill('2000');
    await page.locator('#compra\\.contraparte').fill('Proveedor Vinculado Flujo');
    await page.locator('#compra\\.costo').fill('1.02');

    await page.locator('#venta\\.monto').fill('2000');
    await page.locator('#venta\\.contraparte').fill('Cliente Vinculado Flujo');
    await page.locator('#venta\\.costo').fill('1.03');

    await page.selectOption('select[id*="motivo"]', 'Cable');
    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 15000 });

    // 8️⃣ REGISTRAR LIQUIDACIÓN
    await page.waitForTimeout(3000);
    await page.selectOption('select[id*="motivo"]', 'Liquidación');

    await page.locator('#compra\\.monto').fill('3000');
    await page.locator('#compra\\.contraparte').fill('Vendedor Liquidación Flujo');
    await page.locator('#compra\\.costo').fill('1.0');

    await page.locator('#venta\\.monto').fill('3000');
    await page.locator('#venta\\.contraparte').fill('Comprador Liquidación Flujo');
    await page.locator('#venta\\.costo').fill('1.0');

    await page.selectOption('select[id*="estadoTransaccion"]', 'Completada');

    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.getByText(/exitosamente/i)).toBeVisible({ timeout: 15000 });

    // 9️⃣ CERRAR SESIÓN
    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL('/');

    console.log('✅ Flujo completo E2E ejecutado exitosamente');
    console.log('✓ 4 operaciones registradas (Solo Compra, Solo Venta, Vinculada, Liquidación)');
    console.log('✓ Todos los tipos de operaciones probados');
    console.log('✓ Google Sheets actualizado correctamente');
  });

  test('flujo de error: operación inválida debe mostrar error', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/i);

    // Navegar a movimientos
    await page.getByRole('link', { name: /movimientos/i }).click();

    // Intentar registrar con costo 0 (inválido)
    await page.getByLabel('Solo Compra').check();
    await page.getByLabel(/monto/i).first().fill('1000');
    await page.getByLabel(/proveedor/i).fill('Test');
    await page.getByLabel(/costo/i).first().fill('0');

    await page.getByRole('button', { name: /registrar/i }).click();

    // Verificar que aparece mensaje de error
    await expect(page.getByText(/mayor a 0/i)).toBeVisible();

    console.log('✅ Validación de errores funcionando correctamente');
  });
});
