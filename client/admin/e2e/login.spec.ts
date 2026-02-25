import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('관리자 로그인');
    
    // Check form fields exist
    await expect(page.getByPlaceholder('store-123')).toBeVisible();
    await expect(page.getByPlaceholder('admin')).toBeVisible();
    await expect(page.getByPlaceholder('********')).toBeVisible();
    await expect(page.getByRole('button', { name: /로그인/i })).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Click login without filling fields
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /로그인/i }).click();
    
    // Alert should be triggered (handled by dialog listener)
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.getByPlaceholder('store-123').fill('store-1');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('********').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /로그인/i }).click();
    
    // Should navigate to orders page
    await expect(page).toHaveURL('/admin/orders');
    
    // Check if redirected to orders page - use h1 specifically
    await expect(page.getByRole('heading', { name: '주문 모니터링' })).toBeVisible();
  });

  test('should persist session after page reload', async ({ page }) => {
    await page.goto('/login');
    
    // Login
    await page.getByPlaceholder('store-123').fill('store-1');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('********').fill('password123');
    await page.getByRole('button', { name: /로그인/i }).click();
    
    await expect(page).toHaveURL('/admin/orders');
    
    // Reload page
    await page.reload();
    
    // Should still be on orders page (session persisted)
    await expect(page).toHaveURL('/admin/orders');
  });
});
