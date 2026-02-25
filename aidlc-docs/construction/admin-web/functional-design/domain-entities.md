# Domain Entities - admin-web

## Overview
Admin SPA의 클라이언트 측 데이터 모델 및 TypeScript 인터페이스 정의

---

## Core Entities

### 1. Admin User

```typescript
interface AdminUser {
  id: string;
  storeId: string;
  username: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  tokenExpiry: number; // Unix timestamp
}
```

---

### 2. Table

```typescript
interface Table {
  id: string;
  tableNumber: string;
  isActive: boolean;
  currentSessionId: string | null;
  totalAmount: number;
  orderCount: number;
  lastOrderAt: string | null;
  orders: Order[]; // 현재 세션의 주문 목록
}

interface TableCard {
  table: Table;
  recentOrders: Order[]; // 미리보기용 (전체 표시)
  hasNewOrder: boolean; // 신규 주문 알림 플래그
}
```

---

### 3. Order

```typescript
interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; // 소프트 삭제
  sessionId: string;
}

type OrderStatus = 'pending' | 'preparing' | 'completed';

interface OrderItem {
  menuId: string;
  menuName: string;
  menuNameEn: string;
  quantity: number;
  price: number;
  subtotal: number;
}
```

---

### 4. Menu

```typescript
interface Menu {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  displayOrder: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuFormData {
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  price: number;
  categoryId: string;
  imageUrl: string;
}
```

---

### 5. Category

```typescript
interface Category {
  id: string;
  nameKo: string;
  nameEn: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  nameKo: string;
  nameEn: string;
}
```

---

### 6. Historical Order

```typescript
interface HistoricalOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  completedAt: string;
  sessionId: string;
  deletedAt: string | null;
}

interface OrderHistory {
  orders: HistoricalOrder[];
  hasMore: boolean; // Infinite scroll용
  nextCursor: string | null;
}
```

---

## UI State Entities

### 7. Dashboard State

```typescript
interface DashboardState {
  tables: Table[];
  selectedTableId: string | null;
  sidePanelOpen: boolean;
  filterTableId: string | null; // 특정 테이블 필터링
  newOrderIds: Set<string>; // 신규 주문 강조용
}
```

---

### 8. Menu Management State

```typescript
interface MenuManagementState {
  menus: Menu[];
  categories: Category[];
  selectedMenuId: string | null;
  isEditing: boolean;
  currentView: 'list' | 'create' | 'edit';
}
```

---

### 9. SSE Connection State

```typescript
interface SSEState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastEventTime: number | null;
  reconnectAttempts: number;
  error: string | null;
}
```

---

### 10. Loading & Error State

```typescript
interface LoadingState {
  [key: string]: boolean; // 컴포넌트별 로딩 상태
}

interface ErrorState {
  message: string;
  code: string | null;
  timestamp: number;
}
```

---

## API Response Types

### 11. API Responses

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

interface OrderCreatedEvent {
  type: 'order:created';
  data: Order;
}

interface OrderUpdatedEvent {
  type: 'order:updated';
  data: Order;
}

interface OrderDeletedEvent {
  type: 'order:deleted';
  data: { orderId: string; tableId: string };
}

type SSEEvent = OrderCreatedEvent | OrderUpdatedEvent | OrderDeletedEvent;
```

---

## Form Validation Types

### 12. Validation

```typescript
interface ValidationError {
  field: string;
  message: string;
}

interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
}
```

---

## Redux Store Shape

```typescript
interface RootState {
  auth: AuthState;
  dashboard: DashboardState;
  menuManagement: MenuManagementState;
  sse: SSEState;
  loading: LoadingState;
  error: ErrorState | null;
}
```

---

## TypeScript Configuration

**strict mode**: Enabled (`strict: true`)

**Key Rules**:
- `strictNullChecks`: true
- `noImplicitAny`: true
- `strictFunctionTypes`: true
- `strictPropertyInitialization`: true

**API Type Generation**: OpenAPI/Swagger 기반 자동 생성 예정
