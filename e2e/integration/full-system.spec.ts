import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

// ─── Helpers ───

async function customerLogin(page: Page) {
  await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3001/login', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'store-001');
  await page.fill('input[type="number"]', '1');
  await page.fill('input[type="password"]', '1234');
  await page.click('button:has-text("로그인")');
  await expect(page.locator('text=Table Order')).toBeVisible({ timeout: 10000 });
}

async function adminLogin(page: Page) {
  await page.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('http://localhost:3002/login', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input[name="storeId"]', 'store-001');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[type="password"]', 'admin1234');
  await page.click('button:has-text("로그인")');
  await expect(page.locator('h1:has-text("주문 모니터링")')).toBeVisible({ timeout: 10000 });
}

async function apiCustomerLogin(request: APIRequestContext) {
  const res = await request.post('http://localhost:3000/api/table/login', {
    data: { storeId: 'store-001', tableNumber: 1, password: '1234' }
  });
  return (await res.json()).token as string;
}

async function apiAdminLogin(request: APIRequestContext) {
  const res = await request.post('http://localhost:3000/api/admin/login', {
    data: { storeId: 'store-001', username: 'admin', password: 'admin1234' }
  });
  return (await res.json()).token as string;
}

async function apiCreateOrder(request: APIRequestContext, token: string) {
  const res = await request.post('http://localhost:3000/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
    data: { items: [{ menuId: 'menu-001', quantity: 1 }] }
  });
  return await res.json();
}

// ═══════════════════════════════════════════════
// Journey 1: 고객 주문 여정 (US-1.1 ~ US-1.7)
// ═══════════════════════════════════════════════

test.describe('Journey 1: 고객 주문 여정', () => {

  test('US-1.1: 자동 로그인 및 새로고침 유지', async ({ page }) => {
    await customerLogin(page);
    await page.reload({ waitUntil: 'load' });
    await expect(page.locator('text=Table Order')).toBeVisible({ timeout: 10000 });
  });

  test('US-1.2: 카테고리별 메뉴 탐색', async ({ page }) => {
    await customerLogin(page);
    await expect(page.locator('text=불고기').first()).toBeVisible({ timeout: 5000 });

    const tabs = page.locator('div[style*="overflow"] button');
    await expect(tabs).toHaveCount(3);

    // 사이드 카테고리
    await tabs.nth(1).click();
    await expect(page.locator('text=김치').first()).toBeVisible();
    await expect(page.locator('main').locator('text=불고기')).not.toBeVisible();

    // 음료 카테고리
    await tabs.nth(2).click();
    await expect(page.locator('text=콜라')).toBeVisible();

    // 메인 메뉴 복귀
    await tabs.nth(0).click();
    await expect(page.locator('text=불고기').first()).toBeVisible();
  });

  test('US-1.3: 장바구니에 메뉴 추가', async ({ page }) => {
    await customerLogin(page);
    await page.locator('main button:has-text("+")').first().click();
    await page.click('button:has-text("🛒")');
    await expect(page.locator('text=장바구니')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('US-1.4: 장바구니 수량 증가/감소/삭제', async ({ page }) => {
    await customerLogin(page);
    await page.locator('main button:has-text("+")').first().click();
    await page.click('button:has-text("🛒")');

    const cart = page.locator('div[style*="position: fixed"][style*="width: 300"]');
    await cart.locator('button:has-text("+")').click();
    await expect(cart.locator('text=Total: ₩30,000')).toBeVisible();

    await cart.locator('button:has-text("-")').click();
    await expect(cart.locator('text=Total: ₩15,000')).toBeVisible();

    await cart.locator('button:has-text("-")').click();
    await expect(cart.locator('text=Empty')).toBeVisible();
  });

  test('US-1.5: 주문 flow (장바구니→확인→확정→성공→메뉴복귀)', async ({ page }) => {
    await customerLogin(page);

    // 빈 장바구니 → 주문 비활성화
    await page.click('button:has-text("🛒")');
    await expect(page.locator('button:has-text("주문하기")')).toBeDisabled();
    await page.click('button:has-text("×")');

    // 주문 flow
    await page.locator('main button:has-text("+")').first().click();
    await page.click('button:has-text("🛒")');
    await page.click('button:has-text("주문하기")');
    await expect(page.locator('h2:has-text("주문 확정")')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("주문 확정")');
    await expect(page.locator('text=주문이 완료되었습니다')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Table Order')).toBeVisible({ timeout: 10000 });
  });

  test('US-1.5: 추가 주문 시 새 주문 번호', async ({ request }) => {
    const token = await apiCustomerLogin(request);
    const o1 = await apiCreateOrder(request, token);
    const o2 = await apiCreateOrder(request, token);
    expect(o1.orderId).not.toBe(o2.orderId);
  });

  test('US-1.6: 주문 내역 조회', async ({ page, request }) => {
    const token = await apiCustomerLogin(request);
    await apiCreateOrder(request, token);

    await customerLogin(page);
    await page.click('text=주문내역');
    await expect(page.locator('text=불고기').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=대기중').first()).toBeVisible();
  });

  test('US-1.7: 한국어/영어 전환', async ({ page }) => {
    await customerLogin(page);
    await expect(page.locator('text=주문내역')).toBeVisible();

    await page.click('button:has-text("🇰🇷")');
    await expect(page.locator('text=Order History')).toBeVisible();
    await expect(page.locator('text=Bulgogi')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=₩15,000').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════
// Journey 2: 관리자 운영 여정 (US-2.1 ~ US-2.9)
// ═══════════════════════════════════════════════

test.describe('Journey 2: 관리자 운영 여정', () => {

  test('US-2.1: 관리자 로그인 성공', async ({ page }) => {
    await page.goto('http://localhost:3002/login', { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => sessionStorage.clear());
    await page.waitForTimeout(2000);
    await expect(page.locator('h1:has-text("관리자 로그인")')).toBeVisible();
    await page.fill('input[name="storeId"]', 'store-001');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[type="password"]', 'admin1234');
    await page.click('button:has-text("로그인")');
    await expect(page.locator('h1:has-text("주문 모니터링")')).toBeVisible({ timeout: 10000 });
  });

  test('US-2.1: 잘못된 비밀번호 → 401', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/admin/login', {
      data: { storeId: 'store-001', username: 'admin', password: 'wrong' }
    });
    expect(res.ok()).toBeFalsy();
  });

  test('US-2.1: 새로고침 시 세션 유지', async ({ page }) => {
    await adminLogin(page);
    await page.reload({ waitUntil: 'load' });
    await expect(page.locator('h1:has-text("주문 모니터링")')).toBeVisible({ timeout: 10000 });
  });

  test('US-2.2: 대시보드 테이블 카드 표시', async ({ page, request }) => {
    const token = await apiCustomerLogin(request);
    await apiCreateOrder(request, token);
    await adminLogin(page);
    await expect(page.locator('h3:has-text("테이블 1")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=총 주문액').first()).toBeVisible();
    await expect(page.locator('text=주문 수').first()).toBeVisible();
  });

  test('US-2.2: 주문 모니터링 ↔ 메뉴 관리 탭 전환', async ({ page }) => {
    await adminLogin(page);
    await page.click('text=메뉴 관리');
    await expect(page.locator('h1:has-text("메뉴 관리")')).toBeVisible({ timeout: 10000 });
    await page.click('text=주문 모니터링');
    await expect(page.locator('h1:has-text("주문 모니터링")')).toBeVisible({ timeout: 10000 });
  });

  test('US-2.3: 주문 상태 변경 pending→preparing→completed', async ({ request }) => {
    const ct = await apiCustomerLogin(request);
    const { orderId } = await apiCreateOrder(request, ct);
    const at = await apiAdminLogin(request);

    const r1 = await request.put(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
      headers: { Authorization: `Bearer ${at}` }, data: { status: 'preparing' }
    });
    expect(r1.ok()).toBeTruthy();

    const r2 = await request.put(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
      headers: { Authorization: `Bearer ${at}` }, data: { status: 'completed' }
    });
    expect(r2.ok()).toBeTruthy();
  });

  test('US-2.3: 잘못된 상태 전이 거부', async ({ request }) => {
    const ct = await apiCustomerLogin(request);
    const { orderId } = await apiCreateOrder(request, ct);
    const at = await apiAdminLogin(request);
    const res = await request.put(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
      headers: { Authorization: `Bearer ${at}` }, data: { status: 'completed' }
    });
    expect(res.ok()).toBeFalsy();
  });

  test('US-2.3: 사이드 패널 열기/닫기', async ({ page, request }) => {
    const token = await apiCustomerLogin(request);
    await apiCreateOrder(request, token);
    await adminLogin(page);
    await page.click('h3:has-text("테이블 1")');
    await expect(page.locator('h2:has-text("테이블 1")')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("닫기")');
    await expect(page.locator('h2:has-text("테이블 1")')).not.toBeVisible();
  });

  test('US-2.4: 테이블 생성 및 로그인', async ({ request }) => {
    const at = await apiAdminLogin(request);
    const cr = await request.post('http://localhost:3000/api/admin/tables', {
      headers: { Authorization: `Bearer ${at}` },
      data: { tableNumber: 88, password: '8888' }
    });
    expect(cr.ok()).toBeTruthy();

    const lr = await request.post('http://localhost:3000/api/table/login', {
      data: { storeId: 'store-001', tableNumber: 88, password: '8888' }
    });
    expect(lr.ok()).toBeTruthy();
  });

  test('US-2.5: 주문 소프트 삭제', async ({ request }) => {
    const ct = await apiCustomerLogin(request);
    const { orderId } = await apiCreateOrder(request, ct);
    const at = await apiAdminLogin(request);

    const dr = await request.delete(`http://localhost:3000/api/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${at}` }
    });
    expect(dr.ok()).toBeTruthy();

    const dash = await request.get('http://localhost:3000/api/admin/orders', {
      headers: { Authorization: `Bearer ${at}` }
    });
    const { tables } = await dash.json();
    const t = tables.find((x: { id: string }) => x.id === 'table-001');
    const found = t?.orders.find((o: { id: number }) => o.id === orderId);
    expect(found).toBeUndefined();
  });

  test('US-2.6: 이용 완료 후 테이블 비활성화', async ({ request }) => {
    const ct = await apiCustomerLogin(request);
    await apiCreateOrder(request, ct);
    const at = await apiAdminLogin(request);

    const cr = await request.post('http://localhost:3000/api/admin/tables/table-001/complete', {
      headers: { Authorization: `Bearer ${at}` }
    });
    expect(cr.ok()).toBeTruthy();

    const dash = await request.get('http://localhost:3000/api/admin/orders', {
      headers: { Authorization: `Bearer ${at}` }
    });
    const { tables } = await dash.json();
    const t = tables.find((x: { id: string }) => x.id === 'table-001');
    expect(t.isActive).toBe(false);
    expect(t.currentSessionId).toBeNull();
  });

  test('US-2.7: 과거 주문 내역 API', async ({ request }) => {
    const at = await apiAdminLogin(request);
    const res = await request.get('http://localhost:3000/api/admin/orders/history', {
      headers: { Authorization: `Bearer ${at}` }
    });
    expect(res.ok()).toBeTruthy();
  });

  test('US-2.8: 메뉴 목록 조회 (UI)', async ({ page }) => {
    await adminLogin(page);
    await page.click('text=메뉴 관리');
    await expect(page.locator('h1:has-text("메뉴 관리")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=불고기')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=비빔밥')).toBeVisible();
  });

  test('US-2.8: 메뉴 CRUD (API)', async ({ request }) => {
    const at = await apiAdminLogin(request);
    const h = { Authorization: `Bearer ${at}` };

    const cr = await request.post('http://localhost:3000/api/admin/menus', {
      headers: h, data: { nameKo: '테스트', nameEn: 'Test', descKo: '', descEn: '', price: 5000, categoryId: 'cat-001' }
    });
    expect(cr.ok()).toBeTruthy();
    const { menu } = await cr.json();

    const ur = await request.put(`http://localhost:3000/api/admin/menus/${menu.id}`, {
      headers: h, data: { nameKo: '수정', nameEn: 'Upd', price: 7000 }
    });
    expect(ur.ok()).toBeTruthy();

    const dr = await request.delete(`http://localhost:3000/api/admin/menus/${menu.id}`, { headers: h });
    expect(dr.ok()).toBeTruthy();
  });

  test('US-2.8: 가격 유효성 검증', async ({ request }) => {
    const at = await apiAdminLogin(request);
    const h = { Authorization: `Bearer ${at}` };
    const r1 = await request.post('http://localhost:3000/api/admin/menus', {
      headers: h, data: { nameKo: 'x', nameEn: 'x', price: 999, categoryId: 'cat-001' }
    });
    expect(r1.ok()).toBeFalsy();
    const r2 = await request.post('http://localhost:3000/api/admin/menus', {
      headers: h, data: { nameKo: 'x', nameEn: 'x', price: 100001, categoryId: 'cat-001' }
    });
    expect(r2.ok()).toBeFalsy();
  });

  test('US-2.9: 카테고리 CRUD (API)', async ({ request }) => {
    const at = await apiAdminLogin(request);
    const h = { Authorization: `Bearer ${at}` };

    const cr = await request.post('http://localhost:3000/api/admin/categories', {
      headers: h, data: { name: '테스트' }
    });
    expect(cr.ok()).toBeTruthy();
    const { category } = await cr.json();

    const ur = await request.put(`http://localhost:3000/api/admin/categories/${category.id}`, {
      headers: h, data: { name: '수정' }
    });
    expect(ur.ok()).toBeTruthy();

    const dr = await request.delete(`http://localhost:3000/api/admin/categories/${category.id}`, { headers: h });
    expect(dr.ok()).toBeTruthy();
  });

  test('US-2.9: 메뉴 있는 카테고리 삭제 불가', async ({ request }) => {
    const at = await apiAdminLogin(request);
    const res = await request.delete('http://localhost:3000/api/admin/categories/cat-001', {
      headers: { Authorization: `Bearer ${at}` }
    });
    expect(res.ok()).toBeFalsy();
  });
});

// ═══════════════════════════════════════════════
// Cross-Journey: 고객 ↔ 관리자 실시간 동기화
// ═══════════════════════════════════════════════

test.describe('Cross-Journey: 실시간 동기화', () => {

  test('고객 주문 시 관리자 대시보드에 실시간 반영', async ({ browser }) => {
    // Admin 페이지 열기
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
    await adminPage.evaluate(() => sessionStorage.clear());
    await adminPage.goto('http://localhost:3002/login', { waitUntil: 'load', timeout: 30000 });
    await adminPage.waitForTimeout(2000);
    await adminPage.fill('input[name="storeId"]', 'store-001');
    await adminPage.fill('input[name="username"]', 'admin');
    await adminPage.fill('input[type="password"]', 'admin1234');
    await adminPage.click('button:has-text("로그인")');
    await expect(adminPage.locator('h1:has-text("주문 모니터링")')).toBeVisible({ timeout: 10000 });

    // 초기 주문 수 확인
    const tableCard = adminPage.locator('[role="button"]:has-text("테이블 1")');
    await expect(tableCard).toBeVisible({ timeout: 5000 });
    const initialText = await tableCard.innerText();

    // Customer 페이지에서 주문
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:3001/login', { waitUntil: 'load', timeout: 30000 });
    await customerPage.waitForTimeout(2000);
    await customerPage.fill('input[type="text"]', 'store-001');
    await customerPage.fill('input[type="number"]', '1');
    await customerPage.fill('input[type="password"]', '1234');
    await customerPage.click('button:has-text("로그인")');
    await expect(customerPage.locator('text=Table Order')).toBeVisible({ timeout: 10000 });

    // 메뉴 추가 → 주문 완료
    await customerPage.locator('main button:has-text("+")').first().click();
    await customerPage.click('button:has-text("🛒")');
    await customerPage.click('button:has-text("주문하기")');
    await expect(customerPage.locator('h2:has-text("주문 확정")')).toBeVisible({ timeout: 5000 });
    await customerPage.click('button:has-text("주문 확정")');
    await expect(customerPage.locator('text=주문이 완료되었습니다')).toBeVisible({ timeout: 10000 });

    // Admin 대시보드에 주문이 실시간 반영되었는지 확인
    await expect(async () => {
      const updatedText = await tableCard.innerText();
      expect(updatedText).not.toBe(initialText);
    }).toPass({ timeout: 10000 });

    // 테이블 1 카드에 주문 금액이 표시되는지 확인
    await expect(tableCard).toContainText('₩');

    await adminContext.close();
    await customerContext.close();
  });

  test('관리자 상태 변경 시 고객 주문내역에 실시간 반영', async ({ browser, request }) => {
    // API로 주문 생성
    const token = await apiCustomerLogin(request);
    const { orderId } = await apiCreateOrder(request, token);

    // Customer 페이지 열기 → 주문내역
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:3001/login', { waitUntil: 'load', timeout: 30000 });
    await customerPage.waitForTimeout(2000);
    await customerPage.fill('input[type="text"]', 'store-001');
    await customerPage.fill('input[type="number"]', '1');
    await customerPage.fill('input[type="password"]', '1234');
    await customerPage.click('button:has-text("로그인")');
    await expect(customerPage.locator('text=Table Order')).toBeVisible({ timeout: 10000 });
    await customerPage.click('text=주문내역');
    await expect(customerPage.locator('text=대기중').first()).toBeVisible({ timeout: 10000 });

    // Admin API로 상태 변경: pending → preparing
    const adminToken = await apiAdminLogin(request);
    await request.put(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'preparing' }
    });

    // Customer 주문내역에 상태가 실시간 반영되는지 확인
    await expect(customerPage.locator('text=준비중').first()).toBeVisible({ timeout: 10000 });

    await customerContext.close();
  });
});

// ═══════════════════════════════════════════════
// 세션 만료 & 로그인 보안 (DB 상태 변경 - 마지막 실행)
// ═══════════════════════════════════════════════

test.describe('세션 만료 & 보안', () => {

  test('US-1.8: 세션 완료 후 고객 주문 불가', async ({ request }) => {
    // 새 테이블로 테스트 (기존 테이블 오염 방지)
    const at = await apiAdminLogin(request);
    await request.post('http://localhost:3000/api/admin/tables', {
      headers: { Authorization: `Bearer ${at}` },
      data: { tableNumber: 77, password: '7777' }
    });

    const loginRes = await request.post('http://localhost:3000/api/table/login', {
      data: { storeId: 'store-001', tableNumber: 77, password: '7777' }
    });
    const { token: ct, tableId } = await loginRes.json();

    // 주문 1건 생성 (세션 활성화)
    await apiCreateOrder(request, ct);

    // 관리자가 이용 완료
    await request.post(`http://localhost:3000/api/admin/tables/${tableId}/complete`, {
      headers: { Authorization: `Bearer ${at}` }
    });

    // 이후 주문 시도 → 실패
    const orderRes = await request.post('http://localhost:3000/api/orders', {
      headers: { Authorization: `Bearer ${ct}` },
      data: { items: [{ menuId: 'menu-001', quantity: 1 }] }
    });
    expect(orderRes.ok()).toBeFalsy();
  });

  test('US-2.1: 5회 실패 후 로그인 차단', async ({ request }) => {
    for (let i = 0; i < 5; i++) {
      await request.post('http://localhost:3000/api/admin/login', {
        data: { storeId: 'store-001', username: 'admin', password: 'wrong' }
      });
    }
    const res = await request.post('http://localhost:3000/api/admin/login', {
      data: { storeId: 'store-001', username: 'admin', password: 'admin1234' }
    });
    expect(res.status()).toBe(423);
  });
});
