# Contract/Interface Definition for admin-web

## Unit Context
- **Unit**: admin-web (Unit 3)
- **Type**: React SPA
- **Stories**: US-2.1 ~ US-2.9 (관리자 기능 전체)
- **Dependencies**: 
  - API Server (Unit 1) - REST API 및 SSE 엔드포인트
- **Database Entities**: None (클라이언트 측 상태 관리만)
- **Service Boundaries**: 
  - 관리자 인증 및 세션 관리
  - 주문 모니터링 및 상태 관리
  - 테이블 관리
  - 메뉴/카테고리 관리

---

## Redux Store Structure

### AuthSlice
```typescript
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  tokenExpiry: number;
}

// Actions
- loginRequest(credentials: LoginCredentials): AsyncThunk
- loginSuccess(user: AdminUser, token: string): Action
- loginFailure(error: string): Action
- logout(): Action
- restoreSession(): AsyncThunk
```

### DashboardSlice
```typescript
interface DashboardState {
  tables: Table[];
  selectedTableId: string | null;
  sidePanelOpen: boolean;
  filterTableId: string | null;
  newOrderIds: Set<string>;
}

// Actions
- fetchTables(): AsyncThunk
- selectTable(tableId: string): Action
- openSidePanel(): Action
- closeSidePanel(): Action
- markOrderAsNew(orderId: string): Action
- clearNewOrderFlag(orderId: string): Action
- orderReceived(order: Order): Action
- orderUpdated(order: Order): Action
- orderDeleted(orderId: string, tableId: string): Action
```

### OrdersSlice
```typescript
interface OrdersState {
  orders: Record<string, Order>;
  loading: Record<string, boolean>;
}

// Actions
- updateOrderStatus(orderId: string, status: OrderStatus): AsyncThunk
- deleteOrder(orderId: string): AsyncThunk
- completeSession(tableId: string): AsyncThunk
```

### OrderHistorySlice
```typescript
interface OrderHistoryState {
  orders: HistoricalOrder[];
  hasMore: boolean;
  nextCursor: string | null;
  loading: boolean;
}

// Actions
- fetchOrderHistory(tableId: string, cursor?: string): AsyncThunk
- loadMoreHistory(tableId: string): AsyncThunk
```

### MenuManagementSlice
```typescript
interface MenuManagementState {
  menus: Menu[];
  categories: Category[];
  selectedMenuId: string | null;
  isEditing: boolean;
  currentView: 'list' | 'create' | 'edit';
}

// Actions
- fetchMenus(): AsyncThunk
- fetchCategories(): AsyncThunk
- createMenu(menuData: MenuFormData): AsyncThunk
- updateMenu(id: string, menuData: MenuFormData): AsyncThunk
- deleteMenu(menuId: string): AsyncThunk
- moveMenuUp(menuId: string): AsyncThunk
- moveMenuDown(menuId: string): AsyncThunk
```

### SSESlice
```typescript
interface SSEState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastEventTime: number | null;
  reconnectAttempts: number;
  error: string | null;
}

// Actions
- sseConnected(): Action
- sseDisconnected(): Action
- sseReconnecting(attempts: number, delay: number): Action
- sseError(error: string): Action
```

---

## Custom Hooks

### useSSE
```typescript
/**
 * SSE 연결 관리 및 이벤트 처리
 * 
 * Features:
 * - EventSource 연결 생성 및 관리
 * - order:created, order:updated, order:deleted 이벤트 처리
 * - Exponential backoff 재연결
 * - Redux dispatch 통합
 * 
 * Returns: void
 */
function useSSE(): void
```

---

## React Components

### App
```typescript
/**
 * 루트 애플리케이션 컴포넌트
 * 
 * Responsibilities:
 * - Redux Provider 설정
 * - Router 설정
 * - SSE 연결 초기화
 */
function App(): JSX.Element
```

### LoginPage
```typescript
/**
 * 관리자 로그인 페이지
 * 
 * Props: None
 * 
 * State:
 * - formData: { storeId: string, username: string, password: string }
 * - isLoading: boolean
 * 
 * Methods:
 * - handleSubmit(e: FormEvent): Promise<void>
 *   - Validates required fields
 *   - Dispatches loginRequest
 *   - Stores token in localStorage
 *   - Navigates to /admin/orders on success
 *   - Shows alert on failure
 */
function LoginPage(): JSX.Element
```

### AdminLayout
```typescript
/**
 * 관리자 레이아웃 컴포넌트
 * 
 * Props: None
 * 
 * Responsibilities:
 * - 인증 가드 (세션 만료 체크)
 * - Header 렌더링
 * - Outlet 렌더링
 */
function AdminLayout(): JSX.Element
```

### Header
```typescript
/**
 * 헤더 컴포넌트 (탭 네비게이션 + 로그아웃)
 * 
 * Props: None
 * 
 * Methods:
 * - handleLogout(): void
 *   - Dispatches logout action
 *   - Removes token from localStorage
 *   - Navigates to /login
 */
function Header(): JSX.Element
```

### OrderMonitoringTab
```typescript
/**
 * 주문 모니터링 탭 (대시보드)
 * 
 * Props: None
 * 
 * Responsibilities:
 * - 테이블 목록 fetch
 * - 5분마다 polling
 * - DashboardGrid 렌더링
 * - OrderDetailSidePanel 렌더링
 */
function OrderMonitoringTab(): JSX.Element
```

### DashboardGrid
```typescript
/**
 * 테이블 카드 그리드
 * 
 * Props:
 * - tables: Table[]
 * 
 * Methods:
 * - handleCardClick(tableId: string): void
 *   - Dispatches selectTable
 *   - Dispatches openSidePanel
 */
function DashboardGrid(props: DashboardGridProps): JSX.Element
```

### TableCard
```typescript
/**
 * 테이블 카드 컴포넌트
 * 
 * Props:
 * - table: Table
 * - isNew: boolean
 * - onClick: () => void
 * 
 * Responsibilities:
 * - 테이블 정보 표시 (번호, 총액, 주문 수)
 * - 전체 주문 미리보기 (스크롤)
 * - 신규 주문 강조 (애니메이션)
 * - 활성/비활성 시각적 구분
 */
function TableCard(props: TableCardProps): JSX.Element
```

### OrderDetailSidePanel
```typescript
/**
 * 주문 상세 사이드 패널 (slide-in overlay)
 * 
 * Props: None
 * 
 * Methods:
 * - handleClose(): void
 *   - Dispatches closeSidePanel
 * 
 * Responsibilities:
 * - 선택된 테이블의 전체 주문 표시
 * - OrderList 렌더링
 * - 과거 내역 보기 버튼
 * - 이용 완료 버튼
 */
function OrderDetailSidePanel(): JSX.Element
```

### OrderList
```typescript
/**
 * 주문 목록 컴포넌트
 * 
 * Props:
 * - orders: Order[]
 * 
 * State:
 * - deletingOrderId: string | null
 * - confirmStep: 1 | 2
 * 
 * Methods:
 * - handleStatusChange(order: Order): void
 *   - Confirms if status is 'completed'
 *   - Dispatches updateOrderStatus
 * 
 * - handleDelete(orderId: string): void
 *   - Step 1: "삭제하시겠습니까?"
 *   - Step 2: "정말 삭제하시겠습니까?"
 *   - Dispatches deleteOrder
 * 
 * Helpers:
 * - getNextStatus(status: OrderStatus): OrderStatus
 * - getNextStatusLabel(status: OrderStatus): string
 */
function OrderList(props: OrderListProps): JSX.Element
```

### MenuManagementTab
```typescript
/**
 * 메뉴 관리 탭 (라우터)
 * 
 * Props: None
 * 
 * Routes:
 * - / → MenuListView
 * - /create → MenuCreatePage
 * - /:id/edit → MenuEditPage
 */
function MenuManagementTab(): JSX.Element
```

### MenuListView
```typescript
/**
 * 메뉴 목록 화면
 * 
 * Props: None
 * 
 * State:
 * - selectedCategoryId: string | null
 * 
 * Methods:
 * - handleMoveUp(menuId: string): void
 *   - Dispatches moveMenuUp
 * 
 * - handleMoveDown(menuId: string): void
 *   - Dispatches moveMenuDown
 * 
 * - handleDelete(menuId: string): void
 *   - Confirms deletion
 *   - Dispatches deleteMenu
 * 
 * Responsibilities:
 * - 카테고리 필터링
 * - 메뉴 테이블 표시
 * - 메뉴 생성 버튼
 * - 메뉴 수정/삭제 버튼
 * - 노출 순서 조정 (Up/Down)
 */
function MenuListView(): JSX.Element
```

### MenuCreatePage / MenuEditPage
```typescript
/**
 * 메뉴 생성/수정 페이지
 * 
 * Props: None (URL params for edit)
 * 
 * State:
 * - formData: MenuFormData
 * - isLoading: boolean
 * 
 * Methods:
 * - handleSubmit(e: FormEvent): Promise<void>
 *   - Validates required fields
 *   - Validates URL format
 *   - Dispatches createMenu or updateMenu
 *   - Navigates to /admin/menus on success
 *   - Shows alert on failure
 * 
 * Validation:
 * - Required: nameKo, nameEn, categoryId
 * - Price > 0
 * - imageUrl format (http/https)
 */
function MenuCreatePage(): JSX.Element
function MenuEditPage(): JSX.Element
```

---

## Utility Functions

### Session Management
```typescript
/**
 * 세션 유효성 검증
 * 
 * Returns: boolean - 세션이 유효하면 true
 */
function validateSession(): boolean

/**
 * 토큰 만료 시간 체크
 * 
 * Returns: boolean - 만료되었으면 true
 */
function isTokenExpired(): boolean
```

### SSE Helpers
```typescript
/**
 * SSE 이벤트 처리
 * 
 * Args:
 * - event: SSEEvent
 * 
 * Returns: Redux Thunk
 */
function handleSSEEvent(event: SSEEvent): ThunkAction

/**
 * SSE 재연결 로직 (Exponential backoff)
 * 
 * Returns: Redux Thunk
 */
function reconnectSSE(): ThunkAction

/**
 * 재연결 시도 횟수 리셋
 */
function resetReconnectAttempts(): void

/**
 * 알림 소리 재생
 */
function playNotificationSound(): void
```

### Data Transformation
```typescript
/**
 * 테이블 주문 집계
 * 
 * Args:
 * - orders: Order[]
 * 
 * Returns: { totalAmount: number, orderCount: number, lastOrderAt: string | null }
 */
function aggregateTableOrders(orders: Order[]): TableAggregation

/**
 * 메뉴 정렬 (displayOrder 기준)
 * 
 * Args:
 * - menus: Menu[]
 * 
 * Returns: Menu[]
 */
function sortMenusByDisplayOrder(menus: Menu[]): Menu[]

/**
 * 메뉴 정렬 (카테고리 + displayOrder)
 * 
 * Args:
 * - menus: Menu[]
 * - categories: Category[]
 * 
 * Returns: Menu[]
 */
function sortMenusByCategory(menus: Menu[], categories: Category[]): Menu[]
```

### Form Validation
```typescript
/**
 * 로그인 폼 검증
 * 
 * Args:
 * - formData: { storeId: string, username: string, password: string }
 * 
 * Returns: ValidationError[]
 */
function validateLoginForm(formData: LoginFormData): ValidationError[]

/**
 * 메뉴 폼 검증
 * 
 * Args:
 * - formData: MenuFormData
 * 
 * Returns: ValidationError[]
 */
function validateMenuForm(formData: MenuFormData): ValidationError[]

/**
 * URL 형식 검증
 * 
 * Args:
 * - url: string
 * 
 * Returns: boolean
 */
function isValidUrl(url: string): boolean
```

### API Error Handling
```typescript
/**
 * API 에러 처리
 * 
 * Args:
 * - error: any
 * 
 * Side Effects:
 * - Shows alert dialog
 * - Redirects to login on 401
 */
function handleApiError(error: any): void

/**
 * API 재시도 (사용자 확인)
 * 
 * Args:
 * - action: AsyncThunk
 * 
 * Returns: Redux Thunk
 */
function retryApiCall(action: AsyncThunk): ThunkAction
```

---

## API Integration

### API Client Setup
```typescript
/**
 * Axios 인스턴스 설정
 * 
 * Features:
 * - Base URL 설정
 * - Authorization header 자동 추가
 * - 401 응답 시 자동 로그아웃
 */
const api: AxiosInstance
```

### API Endpoints (consumed by Redux Thunks)
```typescript
// Auth
POST /api/auth/login
  Body: { storeId: string, username: string, password: string }
  Response: { user: AdminUser, token: string, expiresIn: number }

// Tables
GET /api/tables
  Response: { tables: Table[] }

POST /api/admin/tables
  Body: { tableNumber: string, password: string }
  Response: { table: Table }

POST /api/admin/tables/:id/complete
  Response: { success: boolean }

// Orders
PATCH /api/orders/:id/status
  Body: { status: OrderStatus }
  Response: { order: Order }

DELETE /api/orders/:id
  Response: { success: boolean }

GET /api/tables/:id/history?cursor=xxx
  Response: { orders: HistoricalOrder[], hasMore: boolean, nextCursor: string | null }

// Menus
GET /api/menus
  Response: { menus: Menu[] }

POST /api/menus
  Body: MenuFormData
  Response: { menu: Menu }

PUT /api/menus/:id
  Body: MenuFormData
  Response: { menu: Menu }

DELETE /api/menus/:id
  Response: { success: boolean }

PATCH /api/menus/:id/order
  Body: { displayOrder: number }
  Response: { menu: Menu }

// Categories
GET /api/categories
  Response: { categories: Category[] }

// SSE
GET /api/sse?token=xxx
  Events:
  - order:created → { type, data: Order }
  - order:updated → { type, data: Order }
  - order:deleted → { type, data: { orderId, tableId } }
```

---

## Summary

**Total Contracts**:
- Redux Slices: 6 (Auth, Dashboard, Orders, OrderHistory, MenuManagement, SSE)
- Custom Hooks: 1 (useSSE)
- React Components: 12
- Utility Functions: 15
- API Endpoints: 14

**Test Coverage Areas**:
- Redux actions and reducers
- Custom hooks (useSSE)
- Component rendering and user interactions
- Form validation
- API error handling
- SSE event processing
- Data transformations
