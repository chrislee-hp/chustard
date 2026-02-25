# Functional Design - Customer SPA

## Stories: US-1.1~1.8

## Pages

| Page | Route | Description |
|---|---|---|
| TableLoginPage | `/login` | 테이블 번호/비밀번호 입력 (최초 1회) |
| MenuPage | `/menu` | 카테고리 탭 + 메뉴 카드 + 장바구니 사이드 패널 |
| OrderConfirmPage | `/order/confirm` | 주문 확인 화면 |
| OrderSuccessPage | `/order/success` | 주문 성공 (5초 후 메뉴로 리다이렉트) |
| OrderHistoryPage | `/orders` | 주문 내역 (SSE 실시간 상태) |
| SessionExpiredPage | `/expired` | 세션 만료 안내 |

## Component Hierarchy

```
App
├── LanguageToggle (🇰🇷/🇺🇸)
├── TableLoginPage
├── MenuPage
│   ├── CategoryTabs
│   ├── MenuGrid
│   │   └── MenuCard (tap → add to cart)
│   └── CartPanel (right side)
│       ├── CartItem (qty +/-)
│       └── OrderButton (disabled when empty)
├── OrderConfirmPage
├── OrderSuccessPage
├── OrderHistoryPage
│   └── OrderCard (status badge with SSE)
└── SessionExpiredPage
```

## State Management

| State | Storage | Scope |
|---|---|---|
| token, tableId, sessionId | localStorage | 인증 |
| cart items | localStorage | 장바구니 (새로고침 유지) |
| language (ko/en) | localStorage | i18n |
| orders | React state + SSE | 주문 내역 |
| menus/categories | React state (fetch) | 메뉴 |

## Key Flows

- **자동 로그인**: localStorage에 token 있으면 verify → 성공 시 /menu, 실패 시 /login
- **장바구니**: 메뉴 카드 탭 → cart에 추가, qty 0 → 자동 제거, localStorage 동기화
- **주문**: cart items → POST /api/orders → 성공 시 cart 비우기 → /order/success (5초)
- **SSE**: /orders 페이지에서 SSE 연결, order:status-changed → 실시간 반영, table:completed → /expired
