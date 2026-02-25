# Customer SPA - TDD Code Generation Plan

## Phase 1: Monorepo 설정
- [x] Step 1.1: Root package.json (workspaces 설정)
- [x] Step 1.2: Customer SPA 프로젝트 초기화 (Vite + React + TS)
- [x] Step 1.3: Vitest 설정 (Unit 테스트)
- [x] Step 1.4: Root Playwright 설정 (E2E 테스트)

## Phase 2: Core Infrastructure (TDD)
- [x] Step 2.1: [TEST] Context 테스트 (Auth, Cart, I18n, Toast)
- [x] Step 2.2: [CODE] Context 구현
- [x] Step 2.3: [TEST] Custom Hooks 테스트 (useSSE, useApi)
- [x] Step 2.4: [CODE] Custom Hooks 구현

## Phase 3: Components (TDD)
- [x] Step 3.1: [TEST] UI 컴포넌트 테스트
- [x] Step 3.2: [CODE] UI 컴포넌트 구현
- [x] Step 3.3: [TEST] Page 컴포넌트 테스트
- [x] Step 3.4: [CODE] Page 컴포넌트 구현

## Phase 4: Integration
- [x] Step 4.1: App 라우팅 및 AuthGuard
- [x] Step 4.2: i18n 번역 파일

## Phase 5: E2E Tests (Playwright)
- [x] Step 5.1: 로그인 → 메뉴 조회 시나리오
- [x] Step 5.2: 장바구니 → 주문 생성 시나리오
