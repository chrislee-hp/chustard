import { test, expect } from '@playwright/test';

const STORE_ID = 'test-store-id';

async function customerLogin(page) {
  await page.goto('/login');
  await page.locator('#storeId').fill(STORE_ID);
  await page.locator('#tableNumber').fill('1');
  await page.locator('#password').fill('1234');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('text=김치찌개')).toBeVisible({ timeout: 10000 });
}

test.describe('Customer SPA', () => {
  test('로그인 페이지 표시', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('테이블 로그인');
  });

  test('테이블 로그인 → 메뉴 페이지', async ({ page }) => {
    await customerLogin(page);
    await expect(page.locator('text=된장찌개')).toBeVisible();
  });

  test('로그인 실패 → 에러 메시지', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#storeId').fill(STORE_ID);
    await page.locator('#tableNumber').fill('1');
    await page.locator('#password').fill('wrong');
    await page.locator('button[type="submit"]').click();
    // 서버 응답 파싱 후 'Login failed' 표시
    await expect(page.locator('[style*="color"]')).toBeVisible({ timeout: 5000 });
  });

  test('메뉴 카테고리 탭 전환', async ({ page }) => {
    await customerLogin(page);
    await expect(page.locator('text=메인메뉴')).toBeVisible();
    await expect(page.locator('text=음료')).toBeVisible();
    await page.locator('button:has-text("음료")').click();
    await expect(page.locator('text=콜라')).toBeVisible();
  });

  test('메뉴 클릭 → 장바구니 추가', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await expect(page.getByText('합계:', { exact: false })).toBeVisible();
  });

  test('장바구니 수량 증감', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await page.locator('[role="button"]:has-text("김치찌개")').first().click();
    await expect(page.getByText('합계:', { exact: false })).toContainText('18,000');
  });

  test('언어 전환 ko→en', async ({ page }) => {
    await customerLogin(page);
    await page.locator('button:has-text("한국어")').click();
    await expect(page.locator('text=Kimchi Stew')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Main")')).toBeVisible();
    await expect(page.locator('button:has-text("Drinks")')).toBeVisible();
  });

  test('주문 플로우: 메뉴 선택 → 주문 확인 페이지', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await expect(page.getByText('합계:', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: '주문하기' }).click();
    // 주문 확인 페이지 도달
    await expect(page.locator('text=김치찌개')).toBeVisible();
    await expect(page.getByText('합계:', { exact: false })).toBeVisible();
  });

  test('주문 내역 페이지 이동', async ({ page }) => {
    await customerLogin(page);
    await page.getByRole('button', { name: '주문내역 보기' }).click();
    await expect(page.locator('h1')).toContainText('주문내역', { timeout: 5000 });
  });

  test('주문 완료 후 주문내역에 표시', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await page.getByRole('button', { name: '주문하기' }).click();
    await page.getByRole('button', { name: '확인' }).click();
    // 주문 성공 페이지
    await expect(page.locator('h1')).toContainText('주문', { timeout: 10000 });
    // 메뉴로 돌아간 후 주문내역 확인
    await page.goto('/orders');
    await expect(page.locator('text=김치찌개').first()).toBeVisible({ timeout: 5000 });
  });

  test('인증 없이 메뉴 접근 → 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.locator('h1')).toContainText('테이블 로그인', { timeout: 5000 });
  });

  test('장바구니 사이드 패널 표시', async ({ page }) => {
    await customerLogin(page);
    await expect(page.getByRole('heading', { name: '장바구니' })).toBeVisible();
    await expect(page.getByText('장바구니가 비어있습니다')).toBeVisible();
    // 주문하기 버튼 비활성화
    const orderBtn = page.getByRole('button', { name: '주문하기' });
    await expect(orderBtn).toBeDisabled();
  });

  test('장바구니 비우기 버튼', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await expect(page.getByText('합계:', { exact: false })).toContainText('9,000');
    await page.getByRole('button', { name: '장바구니 비우기' }).click();
    await expect(page.getByText('장바구니가 비어있습니다')).toBeVisible();
  });

  test('수량 0 → 장바구니에서 자동 삭제', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await expect(page.getByText('합계:', { exact: false })).toContainText('9,000');
    await page.locator('[aria-label="Decrease quantity"]').click();
    await expect(page.getByText('장바구니가 비어있습니다')).toBeVisible();
  });

  test('주문 성공 페이지에 주문 내역 요약 표시', async ({ page }) => {
    await customerLogin(page);
    await page.locator('text=김치찌개').first().click();
    await page.getByRole('button', { name: '주문하기' }).click();
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.locator('h1')).toContainText('주문', { timeout: 10000 });
    // 주문번호와 내역 요약 표시
    await expect(page.locator('text=김치찌개 x 1')).toBeVisible();
    await expect(page.getByText('합계:', { exact: false })).toBeVisible();
  });
});
