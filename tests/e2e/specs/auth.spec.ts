import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar página de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('debe rechazar credenciales inválidas', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
  });

  test('debe iniciar sesión correctamente con credenciales válidas', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/\/dashboard/i);
    await expect(page.getByText(/bienvenido/i)).toBeVisible();
  });

  test('debe mantener sesión después de recargar página', async ({ page }) => {
    // Login
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/dashboard/i);

    // Recargar página
    await page.reload();

    // Debe seguir en dashboard (no redirigir a login)
    await expect(page).toHaveURL(/\/dashboard/i);
  });

  test('debe cerrar sesión correctamente', async ({ page }) => {
    // Login primero
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/dashboard/i);

    // Cerrar sesión
    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    // Debe redirigir a login
    await expect(page).toHaveURL('/');
  });
});
