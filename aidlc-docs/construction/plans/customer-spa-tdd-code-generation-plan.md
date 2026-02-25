# TDD Code Generation Plan - Customer SPA

## Unit Context
- **Workspace Root**: /Users/chrislee/Git/chustard
- **Code Location**: `client/customer/`
- **Tech**: React (Vite), React Router, React Testing Library, Vitest
- **Stories**: US-1.1~1.8

### Plan Step 0: Project Setup
- [x] Initialize Vite + React project
- [x] Install dependencies (react-router-dom, vitest, @testing-library/react, @testing-library/jest-dom, msw)
- [x] i18n setup (ko.json, en.json)
- [x] API client module (fetch wrapper with token)
- [x] MSW handlers (mock API based on api-contract.md)
- [x] Verify: `npm test` runs

### Plan Step 1: Hooks & Utils (TDD)
- [x] useAuth hook - token 관리, auto-login, logout
- [x] useCart hook - add/remove/updateQty/clear, localStorage sync
- [x] useSSE hook - SSE 연결, event handling
- [x] useLanguage hook - toggle, localStorage
- [x] api client - fetchWithAuth, error handling

### Plan Step 2: Pages (TDD)
- [x] TableLoginPage - 로그인 폼, submit, redirect
- [x] MenuPage - 카테고리 탭, 메뉴 그리드, 장바구니 패널
- [x] OrderConfirmPage - 주문 확인, submit
- [x] OrderSuccessPage - 5초 카운트다운, redirect
- [x] OrderHistoryPage - 주문 목록, SSE 상태 업데이트
- [x] SessionExpiredPage - 안내 메시지

### Plan Step 3: Integration
- [x] App routing + auth guard
- [x] LanguageToggle component
- [x] SSE table:completed → /expired redirect
