# Application Design - Component Methods

## API Server Methods

### Auth Module

| Method | Input | Output | Purpose |
|---|---|---|---|
| `POST /api/admin/login` | `{ storeId, username, password }` | `{ token, expiresIn }` | 관리자 로그인, JWT 발급 |
| `POST /api/table/login` | `{ storeId, tableNumber, password }` | `{ token, tableId, sessionId }` | 테이블 태블릿 로그인 |
| `GET /api/auth/verify` | Header: `Authorization: Bearer <token>` | `{ valid, role, tableId? }` | 토큰 검증 |

### Menu Module

| Method | Input | Output | Purpose |
|---|---|---|---|
| `GET /api/menus` | Query: `storeId` | `{ categories: [{ id, name, menus: [...] }] }` | 카테고리별 메뉴 전체 조회 |
| `POST /api/admin/menus` | `{ nameKo, nameEn, descKo, descEn, price, categoryId, imageUrl }` | `{ menu }` | 메뉴 등록 |
| `PUT /api/admin/menus/:id` | `{ nameKo, nameEn, descKo, descEn, price, categoryId, imageUrl }` | `{ menu }` | 메뉴 수정 |
| `DELETE /api/admin/menus/:id` | - | `{ success }` | 메뉴 삭제 |
| `PUT /api/admin/menus/reorder` | `{ menuIds: [] }` | `{ success }` | 메뉴 순서 변경 |
| `POST /api/admin/categories` | `{ name }` | `{ category }` | 카테고리 등록 |
| `PUT /api/admin/categories/:id` | `{ name }` | `{ category }` | 카테고리 수정 |
| `DELETE /api/admin/categories/:id` | - | `{ success }` | 카테고리 삭제 |
| `PUT /api/admin/categories/reorder` | `{ categoryIds: [] }` | `{ success }` | 카테고리 순서 변경 |

### Order Module

| Method | Input | Output | Purpose |
|---|---|---|---|
| `POST /api/orders` | `{ tableId, sessionId, items: [{ menuId, quantity, price }] }` | `{ order }` | 주문 생성 |
| `GET /api/orders` | Query: `tableId, sessionId` | `{ orders: [...] }` | 테이블 세션별 주문 조회 |
| `GET /api/admin/orders` | Query: `storeId` | `{ tables: [{ tableId, orders, totalAmount }] }` | 전체 테이블 주문 조회 (대시보드) |
| `PUT /api/admin/orders/:id/status` | `{ status }` | `{ order }` | 주문 상태 변경 (대기중→준비중→완료) |
| `DELETE /api/admin/orders/:id` | - | `{ success }` | 주문 소프트 삭제 |
| `GET /api/admin/orders/history` | Query: `tableId, date?` | `{ history: [...] }` | 과거 주문 내역 조회 |

### Table Module

| Method | Input | Output | Purpose |
|---|---|---|---|
| `POST /api/admin/tables` | `{ tableNumber, password }` | `{ table }` | 테이블 초기 설정 |
| `GET /api/admin/tables` | Query: `storeId` | `{ tables: [...] }` | 테이블 목록 조회 |
| `POST /api/admin/tables/:id/complete` | - | `{ success }` | 테이블 이용 완료 처리 |

### SSE Module

| Method | Input | Output | Purpose |
|---|---|---|---|
| `GET /api/sse/orders` | Query: `storeId` (admin) 또는 `tableId` (customer) | SSE stream | 실시간 주문 이벤트 스트림 |

**SSE Event Types**:
- `order:created` - 신규 주문 생성
- `order:status-changed` - 주문 상태 변경
- `order:deleted` - 주문 삭제
- `table:completed` - 테이블 이용 완료 (세션 종료)
