# Customer SPA - Frontend Components

## Component Hierarchy

```
App
├── AuthGuard (세션 검증)
│   ├── SessionExpiredPage (세션 만료 시)
│   └── MainLayout (인증 성공 시)
│       ├── Header
│       │   ├── LanguageToggle (🇰🇷/🇺🇸)
│       │   └── OrderHistoryButton
│       ├── MenuPage (기본 화면)
│       │   ├── CategoryTabs
│       │   ├── MenuGrid
│       │   │   └── MenuCard (반복)
│       │   └── CartToggleButton
│       ├── CartPanel (사이드 패널)
│       │   ├── CartItemList
│       │   │   └── CartItem (반복)
│       │   ├── CartSummary
│       │   └── CheckoutButton
│       ├── OrderConfirmPage
│       │   ├── OrderItemList
│       │   └── ConfirmButton
│       ├── OrderSuccessPage
│       │   ├── OrderSummary
│       │   └── CountdownRedirect
│       └── OrderHistoryPage
│           └── OrderCard (반복)
├── LoginSetupPage (초기 설정, 1회)
└── ToastContainer (전역 알림)
```

---

## Page Components

### LoginSetupPage
| Prop | Type | Description |
|------|------|-------------|
| onLoginSuccess | `() => void` | 로그인 성공 콜백 |

**State**: `storeId`, `tableNumber`, `password`, `isLoading`
**API**: `POST /api/table/login`

---

### MenuPage
| Prop | Type | Description |
|------|------|-------------|
| - | - | Props 없음 (전역 상태 사용) |

**State**: `categories`, `selectedCategoryId`, `isLoading`
**API**: `GET /api/menus`

---

### OrderConfirmPage
| Prop | Type | Description |
|------|------|-------------|
| - | - | 장바구니 전역 상태 사용 |

**State**: `isSubmitting`
**API**: `POST /api/orders`

---

### OrderSuccessPage
| Prop | Type | Description |
|------|------|-------------|
| order | `Order` | 생성된 주문 정보 |

**State**: `countdown` (5초 → 0)

---

### OrderHistoryPage
| Prop | Type | Description |
|------|------|-------------|
| - | - | 세션 정보로 조회 |

**State**: `orders`, `isLoading`
**API**: `GET /api/orders`, SSE `order:status-changed`

---

### SessionExpiredPage
| Prop | Type | Description |
|------|------|-------------|
| - | - | Props 없음 |

**UI**: 안내 메시지만 표시 ("이용이 종료되었습니다. 직원에게 문의해주세요")

---

## UI Components

### Header
| Prop | Type | Description |
|------|------|-------------|
| - | - | 전역 상태 사용 |

**Children**: `LanguageToggle`, `OrderHistoryButton`

---

### LanguageToggle
| Prop | Type | Description |
|------|------|-------------|
| - | - | i18n context 사용 |

**Action**: 언어 전환 (ko ↔ en)

---

### CategoryTabs
| Prop | Type | Description |
|------|------|-------------|
| categories | `Category[]` | 카테고리 목록 |
| selectedId | `string` | 선택된 카테고리 ID |
| onSelect | `(id: string) => void` | 선택 콜백 |

---

### MenuGrid
| Prop | Type | Description |
|------|------|-------------|
| menus | `Menu[]` | 메뉴 목록 |
| onAddToCart | `(menu: Menu) => void` | 장바구니 추가 콜백 |

**Layout**: 반응형 그리드 (2~4열)

---

### MenuCard
| Prop | Type | Description |
|------|------|-------------|
| menu | `Menu` | 메뉴 정보 |
| onClick | `() => void` | 클릭 콜백 |

**Display**: 이미지, 메뉴명(i18n), 가격, 설명(i18n)

---

### CartPanel
| Prop | Type | Description |
|------|------|-------------|
| isOpen | `boolean` | 패널 열림 상태 |
| onClose | `() => void` | 닫기 콜백 |

---

### CartItem
| Prop | Type | Description |
|------|------|-------------|
| item | `CartItem` | 장바구니 아이템 |
| onIncrease | `() => void` | 수량 증가 |
| onDecrease | `() => void` | 수량 감소 |

---

### OrderCard
| Prop | Type | Description |
|------|------|-------------|
| order | `Order` | 주문 정보 |

**Display**: 주문번호, 시각, 메뉴목록, 금액, 상태(i18n)

---

### Toast
| Prop | Type | Description |
|------|------|-------------|
| message | `string` | 메시지 |
| type | `'success' \| 'error'` | 타입 |
| duration | `number` | 표시 시간 (ms) |

---

## State Management

### Global State (React Context)

```typescript
// AuthContext
{
  token: string | null;
  tableId: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
}

// CartContext
{
  items: CartItem[];
  totalAmount: number;
}

// I18nContext
{
  locale: 'ko' | 'en';
  t: (key: string) => string;
}

// ToastContext
{
  showToast: (message: string, type: 'success' | 'error') => void;
}
```

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `table_auth` | `{ storeId, tableNumber, password }` | 자동 로그인 정보 |
| `cart_items` | `CartItem[]` | 장바구니 |
| `locale` | `'ko' \| 'en'` | 언어 설정 |

---

## Technical Decisions

| 항목 | 결정 | 비고 |
|------|------|------|
| State 관리 | React Context | 외부 라이브러리 없음 |
| SSE 구현 | 커스텀 Hook (`useSSE`) | `EventSource` API 직접 사용 |
| HTTP Client | axios | API 호출용 |

### SSE Hook 설계

```typescript
// useSSE Hook
function useSSE(url: string, handlers: {
  onOrderStatusChanged: (data) => void;
  onTableCompleted: () => void;
}) {
  // EventSource 연결
  // 재연결 로직: 연결 끊기면 3초 후 재시도
  // cleanup on unmount
}
```

---

## API Integration Map

| Component | API Endpoint | Event |
|-----------|--------------|-------|
| LoginSetupPage | `POST /api/table/login` | - |
| AuthGuard | `GET /api/auth/verify` | - |
| MenuPage | `GET /api/menus` | - |
| OrderConfirmPage | `POST /api/orders` | - |
| OrderHistoryPage | `GET /api/orders` | SSE `order:status-changed` |
| AuthGuard | - | SSE `table:completed` |
