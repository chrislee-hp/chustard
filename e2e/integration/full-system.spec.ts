import { test, expect } from '@playwright/test';

test.describe('Full System Integration', () => {
  test('should handle complete order flow from customer to admin', async ({ page, context }) => {
    // 1. Customer: Login
    await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for React to mount
    
    // Fill all required fields for customer login
    await page.fill('input[type="text"]', 'store1');
    await page.fill('input[type="number"]', '1');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("로그인")');
    await expect(page.locator('h1')).toContainText('메뉴', { timeout: 10000 });

    // 2. Customer: Add items to cart
    const addButtons = page.locator('button:has-text("담기")');
    await addButtons.first().click();
    await addButtons.nth(1).click();
    
    // 3. Customer: Submit order
    await page.click('button:has-text("주문하기")');
    await page.click('button:has-text("확인")');
    await expect(page.locator('text=주문이 완료되었습니다')).toBeVisible();

    // 4. Admin: Open in new tab and login
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
    await adminPage.waitForTimeout(3000); // Wait for React to mount
    await adminPage.fill('input[type="text"]', 'admin');
    await adminPage.fill('input[type="password"]', 'admin123');
    await adminPage.click('button:has-text("로그인")');
    
    // 5. Admin: Verify order appears
    await expect(adminPage.locator('text=Table 1')).toBeVisible({ timeout: 5000 });
    
    // 6. Admin: Click table to see order details
    await adminPage.click('text=Table 1');
    await expect(adminPage.locator('text=주문 상세')).toBeVisible();
    
    // 7. Admin: Update order status
    const statusSelect = adminPage.locator('select');
    await statusSelect.selectOption('preparing');
    await expect(statusSelect).toHaveValue('preparing');

    await adminPage.close();
  });

  test('should sync menu changes from admin to customer', async ({ page, context }) => {
    // 1. Admin: Login
    await page.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("로그인")');
    
    // 2. Admin: Navigate to menu management
    await page.click('text=메뉴 관리');
    await expect(page.locator('h2:has-text("메뉴 관리")')).toBeVisible();
    
    // 3. Admin: Verify menu items exist
    await expect(page.locator('text=김치찌개')).toBeVisible();
    
    // 4. Customer: Open in new tab
    const customerPage = await context.newPage();
    await customerPage.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
    await customerPage.waitForTimeout(3000);
    await customerPage.fill('input[type="text"]', 'store1');
    await customerPage.fill('input[type="number"]', '2');
    await customerPage.fill('input[type="password"]', 'password');
    await customerPage.click('button:has-text("로그인")');
    
    // 5. Customer: Verify same menu items
    await expect(customerPage.locator('text=김치찌개')).toBeVisible();

    await customerPage.close();
  });

  test('should handle real-time SSE updates', async ({ page, context }) => {
    // 1. Admin: Login and stay on dashboard
    await page.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("로그인")');
    await expect(page.locator('h2:has-text("주문 모니터링")')).toBeVisible({ timeout: 10000 });

    // 2. Customer: Create new order in another tab
    const customerPage = await context.newPage();
    await customerPage.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
    await customerPage.waitForTimeout(3000);
    await customerPage.fill('input[type="text"]', 'store1');
    await customerPage.fill('input[type="number"]', '5');
    await customerPage.fill('input[type="password"]', 'password');
    await customerPage.click('button:has-text("로그인")');
    
    await customerPage.locator('button:has-text("담기")').first().click();
    await customerPage.click('button:has-text("주문하기")');
    await customerPage.click('button:has-text("확인")');
    
    // 3. Admin: Verify new order appears via SSE (real-time)
    await expect(page.locator('text=Table 5')).toBeVisible({ timeout: 5000 });

    await customerPage.close();
  });
});
