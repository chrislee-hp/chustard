import { test, expect } from '@playwright/test';

test.describe('Order Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder('store-123').fill('store-1');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('********').fill('password123');
    await page.getByRole('button', { name: /로그인/i }).click();
    await expect(page).toHaveURL('/admin/orders');
  });

  test('should display order monitoring dashboard', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: '주문 모니터링' })).toBeVisible();
  });

  test('should navigate to menu management', async ({ page }) => {
    // Click menu management link
    await page.getByRole('link', { name: '메뉴 관리' }).click();
    
    // Should navigate to menus page
    await expect(page).toHaveURL(/\/admin\/menus/);
    await expect(page.getByRole('heading', { name: '메뉴 관리' })).toBeVisible();
  });
});
