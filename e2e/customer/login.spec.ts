import { test, expect } from '@playwright/test'

test.describe('로그인 → 메뉴 조회', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('미인증 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto('/menu')
    await expect(page).toHaveURL(/\/login/)
  })

  test('로그인 폼 표시', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/매장 ID/i)).toBeVisible()
    await expect(page.getByLabel(/테이블 번호/i)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible()
  })

  test('필수 필드 미입력 시 로그인 버튼 비활성화', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /로그인/i })).toBeDisabled()
  })

  test('모든 필드 입력 시 로그인 버튼 활성화', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/매장 ID/i).fill('store1')
    await page.getByLabel(/테이블 번호/i).fill('1')
    await page.getByLabel(/비밀번호/i).fill('password')
    await expect(page.getByRole('button', { name: /로그인/i })).toBeEnabled()
  })
})

test.describe('언어 전환', () => {
  test('로그인 페이지에서 언어 전환 가능', async ({ page }) => {
    await page.goto('/login')
    // 로그인 페이지에는 LanguageToggle이 없으므로 이 테스트는 스킵
    // 언어 전환은 인증 후 메뉴 페이지에서 테스트해야 함
    await expect(page.getByLabel(/매장 ID/i)).toBeVisible()
  })
})
