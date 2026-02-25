import { test, expect } from '@playwright/test';

const STORE_ID = 'test-store-id';

async function adminLogin(page) {
  await page.goto('/login');
  await page.locator('#storeId').fill(STORE_ID);
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('admin1234');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('h1:has-text("주문 대시보드")')).toBeVisible({ timeout: 10000 });
}

test.describe('Admin SPA', () => {
  test('로그인 페이지 표시', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('관리자 로그인');
  });

  test('관리자 로그인 → 대시보드', async ({ page }) => {
    await adminLogin(page);
  });

  test('로그인 실패 → 에러 메시지', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#storeId').fill(STORE_ID);
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('wrong');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=인증 실패')).toBeVisible({ timeout: 5000 });
  });

  test('네비게이션 바 표시', async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator('nav >> text=대시보드')).toBeVisible();
    await expect(page.locator('nav >> text=테이블 관리')).toBeVisible();
    await expect(page.locator('nav >> text=메뉴 관리')).toBeVisible();
    await expect(page.locator('nav >> text=주문 내역')).toBeVisible();
  });

  test('인증 없이 대시보드 접근 → 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('관리자 로그인', { timeout: 5000 });
  });

  test('대시보드에서 테이블 카드 표시', async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator('[data-testid="table-1"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="table-2"]')).toBeVisible();
  });

  test('테이블 추가', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=테이블 관리').click();
    await expect(page.locator('h1:has-text("테이블 관리")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("테이블 추가")').click();
    await page.locator('input[type="number"]').fill('3');
    await page.locator('input[type="text"]').fill('1234');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.locator('text=테이블 3')).toBeVisible({ timeout: 5000 });
  });

  test('메뉴 관리 페이지 - 메뉴 항목 표시', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=메뉴 관리').click();
    await expect(page.locator('h1:has-text("메뉴 관리")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=김치찌개')).toBeVisible();
    await expect(page.locator('text=된장찌개')).toBeVisible();
  });

  test('카테고리 추가', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=메뉴 관리').click();
    await expect(page.locator('h1:has-text("메뉴 관리")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("카테고리")').click();
    await page.locator('form input').first().fill('디저트');
    await page.locator('form input').nth(1).fill('Dessert');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('h2:has-text("디저트")')).toBeVisible({ timeout: 5000 });
  });

  test('메뉴 추가', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=메뉴 관리').click();
    await expect(page.locator('h1:has-text("메뉴 관리")')).toBeVisible({ timeout: 5000 });
    // "+ 메뉴" 버튼 (정확히 매칭)
    await page.getByRole('button', { name: '+ 메뉴' }).click();
    await page.locator('select').selectOption({ index: 1 });
    await page.locator('input[type="number"]').fill('12000');
    // 폼 내 텍스트 입력 (카테고리 select 제외)
    const form = page.locator('form');
    await form.locator('label:has-text("메뉴명 (한국어)") input').fill('불고기');
    await form.locator('label:has-text("Menu Name") input').fill('Bulgogi');
    await form.locator('button[type="submit"]').click();
    await expect(page.locator('text=불고기')).toBeVisible({ timeout: 5000 });
  });

  test('주문 내역 페이지 이동', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=주문 내역').click();
    await expect(page.locator('h1:has-text("주문 내역")')).toBeVisible({ timeout: 5000 });
  });

  test('주문 내역 페이지 - 주문 후 내역 표시', async ({ browser }) => {
    // Customer에서 주문
    const custCtx = await browser.newContext();
    const custPage = await custCtx.newPage();
    await custPage.goto('http://localhost:5173/login');
    await custPage.locator('#storeId').fill(STORE_ID);
    await custPage.locator('#tableNumber').fill('1');
    await custPage.locator('#password').fill('1234');
    await custPage.locator('button[type="submit"]').click();
    await expect(custPage.locator('text=김치찌개')).toBeVisible({ timeout: 10000 });
    await custPage.locator('text=김치찌개').first().click();
    await custPage.getByRole('button', { name: '주문하기' }).click();
    await custPage.getByRole('button', { name: '확인' }).click();
    await expect(custPage.locator('h1')).toContainText('주문', { timeout: 10000 });
    await custCtx.close();

    // Admin에서 이용 완료 → 주문 내역 확인
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await adminPage.goto('http://localhost:5174/login');
    await adminPage.locator('#storeId').fill(STORE_ID);
    await adminPage.locator('#username').fill('admin');
    await adminPage.locator('#password').fill('admin1234');
    await adminPage.locator('button[type="submit"]').click();
    await expect(adminPage.locator('h1:has-text("주문 대시보드")')).toBeVisible({ timeout: 10000 });
    adminPage.on('dialog', d => d.accept());
    await adminPage.locator('button:has-text("이용 완료")').first().click();
    await adminPage.waitForTimeout(1000);
    await adminPage.locator('nav >> text=주문 내역').click();
    await expect(adminPage.locator('h1:has-text("주문 내역")')).toBeVisible({ timeout: 5000 });
    await expect(adminPage.locator('text=김치찌개').first()).toBeVisible({ timeout: 5000 });
    await adminCtx.close();
  });

  test('고객 주문 시 대시보드 SSE 실시간 갱신', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('http://localhost:5174/login');
    await adminPage.locator('#storeId').fill(STORE_ID);
    await adminPage.locator('#username').fill('admin');
    await adminPage.locator('#password').fill('admin1234');
    await adminPage.locator('button[type="submit"]').click();
    await expect(adminPage.locator('h1:has-text("주문 대시보드")')).toBeVisible({ timeout: 10000 });

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:5173/login');
    await customerPage.locator('#storeId').fill(STORE_ID);
    await customerPage.locator('#tableNumber').fill('2');
    await customerPage.locator('#password').fill('1234');
    await customerPage.locator('button[type="submit"]').click();
    await expect(customerPage.locator('text=김치찌개')).toBeVisible({ timeout: 10000 });
    await customerPage.locator('text=김치찌개').first().click();
    await customerPage.getByRole('button', { name: '주문하기' }).click();
    await customerPage.getByRole('button', { name: '확인' }).click();
    await expect(customerPage.locator('h1')).toContainText('주문', { timeout: 10000 });

    await expect(adminPage.locator('text=대기중').first()).toBeVisible({ timeout: 10000 });

    await adminContext.close();
    await customerContext.close();
  });

  // 삭제 테스트는 마지막에 (DB 상태 변경)
  test('메뉴 삭제', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=메뉴 관리').click();
    await expect(page.locator('text=콜라')).toBeVisible({ timeout: 5000 });
    page.on('dialog', d => d.accept());
    // 콜라가 포함된 메뉴 아이템 행에서 삭제 버튼 클릭
    const colaRow = page.locator('div').filter({ has: page.locator('div:text-is("콜라")') }).filter({ has: page.locator('button:has-text("삭제")') }).last();
    await colaRow.locator('button:has-text("삭제")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=사이다')).toBeVisible();
  });

  test('대시보드 테이블 카드 클릭 → 사이드 패널 주문 상세', async ({ browser }) => {
    // 먼저 고객 주문 생성
    const custCtx = await browser.newContext();
    const custPage = await custCtx.newPage();
    await custPage.goto('http://localhost:5173/login');
    await custPage.locator('#storeId').fill(STORE_ID);
    await custPage.locator('#tableNumber').fill('1');
    await custPage.locator('#password').fill('1234');
    await custPage.locator('button[type="submit"]').click();
    await expect(custPage.locator('text=김치찌개')).toBeVisible({ timeout: 10000 });
    await custPage.locator('text=김치찌개').first().click();
    await custPage.getByRole('button', { name: '주문하기' }).click();
    await custPage.getByRole('button', { name: '확인' }).click();
    await expect(custPage.locator('h1')).toContainText('주문', { timeout: 10000 });
    await custCtx.close();

    // Admin에서 테이블 카드 클릭 → 사이드 패널
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await adminPage.goto('http://localhost:5174/login');
    await adminPage.locator('#storeId').fill(STORE_ID);
    await adminPage.locator('#username').fill('admin');
    await adminPage.locator('#password').fill('admin1234');
    await adminPage.locator('button[type="submit"]').click();
    await expect(adminPage.locator('h1:has-text("주문 대시보드")')).toBeVisible({ timeout: 10000 });
    // 테이블 1 카드 클릭
    await adminPage.locator('[data-testid="table-1"]').click();
    await expect(adminPage.locator('[data-testid="order-detail"]')).toBeVisible({ timeout: 5000 });
    await expect(adminPage.locator('[data-testid="order-detail"] >> text=김치찌개').first()).toBeVisible();
    // 주문 상태 변경 버튼
    await expect(adminPage.locator('[data-testid="order-detail"] >> button:has-text("준비 시작")')).toBeVisible();
    await adminCtx.close();
  });

  test('주문 상태 순차 변경 (대기중→준비중→완료)', async ({ browser }) => {
    // 고객 주문 생성
    const custCtx = await browser.newContext();
    const custPage = await custCtx.newPage();
    await custPage.goto('http://localhost:5173/login');
    await custPage.locator('#storeId').fill(STORE_ID);
    await custPage.locator('#tableNumber').fill('2');
    await custPage.locator('#password').fill('1234');
    await custPage.locator('button[type="submit"]').click();
    await expect(custPage.locator('text=김치찌개')).toBeVisible({ timeout: 10000 });
    await custPage.locator('text=김치찌개').first().click();
    await custPage.getByRole('button', { name: '주문하기' }).click();
    await custPage.getByRole('button', { name: '확인' }).click();
    await expect(custPage.locator('h1')).toContainText('주문', { timeout: 10000 });
    await custCtx.close();

    // Admin에서 상태 변경
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await adminPage.goto('http://localhost:5174/login');
    await adminPage.locator('#storeId').fill(STORE_ID);
    await adminPage.locator('#username').fill('admin');
    await adminPage.locator('#password').fill('admin1234');
    await adminPage.locator('button[type="submit"]').click();
    await expect(adminPage.locator('h1:has-text("주문 대시보드")')).toBeVisible({ timeout: 10000 });
    await adminPage.locator('[data-testid="table-2"]').click();
    await expect(adminPage.locator('[data-testid="order-detail"]')).toBeVisible({ timeout: 5000 });
    // 대기중 → 준비중
    await adminPage.locator('[data-testid="order-detail"] >> button:has-text("준비 시작")').first().click();
    await expect(adminPage.locator('[data-testid="order-detail"] >> text=준비중').first()).toBeVisible({ timeout: 5000 });
    // 준비중 → 완료
    await adminPage.locator('[data-testid="order-detail"] >> button:has-text("완료 처리")').first().click();
    await expect(adminPage.locator('[data-testid="order-detail"] >> text=완료').first()).toBeVisible({ timeout: 5000 });
    await adminCtx.close();
  });

  test('메뉴 관리 - 카테고리 순서 조정', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=메뉴 관리').click();
    await expect(page.locator('h2:has-text("메인메뉴")')).toBeVisible({ timeout: 5000 });
    // 메인메뉴가 첫 번째 → ▼ 클릭하면 두 번째로
    const firstCatDown = page.locator('h2:has-text("메인메뉴")').locator('..').locator('button:has-text("▼")');
    await firstCatDown.click();
    await page.waitForTimeout(500);
    // 순서 변경 확인: 첫 번째 h2가 메인메뉴가 아님
    const firstH2 = page.locator('h2').first();
    await expect(firstH2).not.toContainText('메인메뉴');
  });

  test('메뉴 관리 - 필수 필드 검증', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=메뉴 관리').click();
    await expect(page.locator('h1:has-text("메뉴 관리")')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '+ 메뉴' }).click();
    // 폼이 표시되는지 확인
    await expect(page.locator('h3:has-text("메뉴 추가")')).toBeVisible();
    // 필수 필드 (카테고리, 메뉴명, 가격)에 required 속성 확인
    await expect(page.locator('select[required]')).toBeVisible();
    await expect(page.locator('input[type="number"][min="100"][max="1000000"]')).toBeVisible();
  });

  test('주문 내역 페이지 - 날짜 필터', async ({ page }) => {
    await adminLogin(page);
    await page.locator('nav >> text=주문 내역').click();
    await expect(page.locator('h1:has-text("주문 내역")')).toBeVisible({ timeout: 5000 });
    // 날짜 필터 입력 존재
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });
});
