# Customer SPA - Business Logic Model

## Core Flows

### 1. 자동 로그인 Flow

```
앱 시작
    ↓
localStorage에 table_auth 있음?
    ├─ No → LoginSetupPage 표시
    └─ Yes → POST /api/table/login (저장된 정보)
                ↓
            성공?
            ├─ Yes → token 저장, MenuPage 이동
            └─ No → localStorage 클리어, LoginSetupPage 표시
```

### 2. 장바구니 Flow

```
메뉴 카드 탭
    ↓
장바구니에 동일 메뉴 있음?
    ├─ No → 새 아이템 추가 (quantity: 1)
    └─ Yes → 기존 아이템 quantity + 1
    ↓
localStorage 저장
totalAmount 재계산
```

### 3. 주문 생성 Flow

```
"주문하기" 버튼 탭
    ↓
OrderConfirmPage 이동
    ↓
"주문 확정" 버튼 탭
    ↓
POST /api/orders
    ↓
성공?
├─ Yes → 장바구니 클리어
│        OrderSuccessPage 이동
│        5초 카운트다운
│        MenuPage 자동 이동
└─ No → 토스트 에러 표시
         장바구니 유지
```

### 4. SSE 연결 Flow

```
인증 성공 후
    ↓
GET /api/sse/orders?tableId={tableId} 연결
    ↓
이벤트 수신 대기
    ├─ order:status-changed → 주문 상태 업데이트 (주문내역 화면 실시간 반영)
    └─ table:completed → SessionExpiredPage 이동 (세션 만료 안내)
```

**SSE 필요 근거**:
- FR-1.5: "SSE를 통한 주문 상태 실시간 업데이트 (MVP 포함)"
- FR-1.6: 관리자 이용 완료 처리 시 고객 화면에 즉시 안내

**수신 이벤트**:
| 이벤트 | 용도 | 처리 |
|--------|------|------|
| `order:status-changed` | 주문 상태 변경 | OrderHistoryPage 상태 업데이트 |
| `table:completed` | 세션 종료 | SessionExpiredPage로 이동 |

---

## Data Transformations

### Menu Display (i18n)

```typescript
function getMenuDisplay(menu: Menu, locale: 'ko' | 'en') {
  return {
    name: locale === 'ko' ? menu.nameKo : menu.nameEn,
    description: locale === 'ko' ? menu.descKo : menu.descEn,
    price: menu.price  // 항상 원화
  };
}
```

### Order Status Display (i18n)

```typescript
const STATUS_LABELS = {
  ko: { pending: '대기중', preparing: '준비중', completed: '완료' },
  en: { pending: 'Pending', preparing: 'Preparing', completed: 'Completed' }
};

function getStatusLabel(status: OrderStatus, locale: 'ko' | 'en') {
  return STATUS_LABELS[locale][status];
}
```

### Cart Total Calculation

```typescript
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
```

---

## State Transitions

### Cart Item Quantity

```
quantity > 0: 아이템 유지
quantity = 0: 아이템 자동 삭제
```

### Session State

```
authenticated → expired (table:completed 수신 시)
expired → (복구 불가, 직원 호출 필요)
```
