import { test, expect } from '@playwright/test';

test.describe('Menu Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder('store-123').fill('store-1');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('********').fill('password123');
    await page.getByRole('button', { name: /로그인/i }).click();
    
    // Navigate to menu management
    await page.getByRole('link', { name: '메뉴 관리' }).click();
    await expect(page).toHaveURL(/\/admin\/menus/);
  });

  test('should display menu list', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: '메뉴 관리' })).toBeVisible();
    
    // Check add menu button
    await expect(page.getByRole('button', { name: /메뉴 추가/i })).toBeVisible();
  });

  test('should navigate back to order monitoring', async ({ page }) => {
    // Click order monitoring link
    await page.getByRole('link', { name: '주문 모니터링' }).click();
    
    // Should navigate back to orders page
    await expect(page).toHaveURL('/admin/orders');
    await expect(page.getByRole('heading', { name: '주문 모니터링' })).toBeVisible();
  });
});
