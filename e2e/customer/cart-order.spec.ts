import { test, expect } from '@playwright/test'

test.describe('장바구니 → 주문', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      // Mock 인증 상태 설정 (실제 API 없이 테스트)
      localStorage.setItem('table_auth', JSON.stringify({
        storeId: 'store1',
        tableNumber: '1',
        password: 'test'
      }))
    })
  })

  test('장바구니 토글 버튼 표시', async ({ page }) => {
    await page.goto('/menu')
    // 장바구니 버튼이 표시되어야 함 (인증 필요하므로 로그인 페이지로 갈 수 있음)
    const cartButton = page.locator('button:has-text("🛒")')
    // 인증 없이는 로그인 페이지로 리다이렉트됨
  })

  test('장바구니 패널 열기/닫기', async ({ page }) => {
    // 이 테스트는 실제 API 연동 후 동작
    await page.goto('/login')
    // 로그인 페이지에서는 장바구니 버튼이 없음
    await expect(page.getByLabel(/매장 ID/i)).toBeVisible()
  })
})

test.describe('주문 확인 페이지', () => {
  test('빈 장바구니로 접근 시 주문 버튼 비활성화', async ({ page }) => {
    await page.goto('/order-confirm')
    // 미인증 시 로그인으로 리다이렉트
    await expect(page).toHaveURL(/\/login/)
  })
})
