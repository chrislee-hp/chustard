# Contract/Interface Definition - API Server

## Unit Context
- **Stories**: US-1.1~1.8, US-2.1~2.9 (전체 17개 스토리의 백엔드 로직)
- **Dependencies**: None (다른 Unit이 이 Unit에 의존)
- **Database Entities**: Store, Admin, Table, Category, Menu, Order, OrderItem, OrderHistory

---

## Repository Layer

### AdminRepository
- `findByStoreAndUsername(storeId, username) -> Admin|null`
- `updateLoginAttempt(id, failedAttempts, lockedUntil) -> void`

### TableRepository
- `findByStoreAndNumber(storeId, tableNumber) -> Table|null`
- `findById(id) -> Table|null`
- `findAllByStore(storeId) -> Table[]`
- `create(table) -> Table`
- `updateSession(id, sessionId, status) -> void`

### CategoryRepository
- `findAllByStore(storeId) -> Category[]`
- `findById(id) -> Category|null`
- `create(category) -> Category`
- `update(id, data) -> Category`
- `delete(id) -> void`
- `updateSortOrders(idOrderPairs) -> void`
- `countMenus(categoryId) -> number`

### MenuRepository
- `findAllByStoreGrouped(storeId) -> CategoryWithMenus[]`
- `findById(id) -> Menu|null`
- `create(menu) -> Menu`
- `update(id, data) -> Menu`
- `delete(id) -> void`
- `updateSortOrders(idOrderPairs) -> void`
- `maxSortOrder(categoryId) -> number`

### OrderRepository
- `create(order, items) -> Order`
- `findByTableSession(tableId, sessionId) -> Order[]`
- `findAllByStore(storeId) -> TableWithOrders[]`
- `findById(id) -> Order|null`
- `updateStatus(id, status) -> void`
- `softDelete(id) -> void`
- `deleteBySession(tableId, sessionId) -> void` (hard delete for table complete)

### OrderHistoryRepository
- `create(history) -> OrderHistory`
- `findByFilters(storeId, tableId?, date?) -> OrderHistory[]`

---

## Service Layer

### AuthService
- `adminLogin(storeId, username, password) -> { token, expiresIn }`
  - Raises: UNAUTHORIZED, LOGIN_LOCKED
- `tableLogin(storeId, tableNumber, password) -> { token, tableId, sessionId }`
  - Raises: UNAUTHORIZED
- `verifyToken(token) -> { valid, role, tableId? }`
  - Raises: UNAUTHORIZED

### MenuService
- `getMenus(storeId) -> CategoryWithMenus[]`
- `createMenu(data) -> Menu`
  - Raises: VALIDATION_ERROR
- `updateMenu(id, data) -> Menu`
  - Raises: NOT_FOUND, VALIDATION_ERROR
- `deleteMenu(id) -> void`
  - Raises: NOT_FOUND
- `reorderMenus(menuIds) -> void`
- `createCategory(storeId, name) -> Category`
- `updateCategory(id, name) -> Category`
  - Raises: NOT_FOUND
- `deleteCategory(id) -> void`
  - Raises: NOT_FOUND, VALIDATION_ERROR (has menus)
- `reorderCategories(categoryIds) -> void`

### OrderService
- `createOrder(tableId, sessionId, items) -> Order`
  - Raises: VALIDATION_ERROR
- `getOrdersBySession(tableId, sessionId) -> Order[]`
- `getAllOrders(storeId) -> TableWithOrders[]`
- `updateOrderStatus(id, status) -> Order`
  - Raises: NOT_FOUND, VALIDATION_ERROR (invalid transition)
- `deleteOrder(id) -> void`
  - Raises: NOT_FOUND
- `getOrderHistory(storeId, tableId?, date?) -> OrderHistory[]`

### TableService
- `createTable(storeId, tableNumber, password) -> Table`
  - Raises: VALIDATION_ERROR (duplicate number)
- `getTables(storeId) -> Table[]`
- `completeTable(id) -> void`
  - Raises: NOT_FOUND

### SSEService
- `addClient(clientId, type, filterId, res) -> void`
- `removeClient(clientId) -> void`
- `broadcast(event, data, storeId?, tableId?) -> void`

---

## API Layer (Routes)

### Auth Routes
- `POST /api/admin/login` → AuthService.adminLogin
- `POST /api/table/login` → AuthService.tableLogin
- `GET /api/auth/verify` → AuthService.verifyToken

### Menu Routes (Admin: auth middleware)
- `GET /api/menus` → MenuService.getMenus
- `POST /api/admin/menus` → MenuService.createMenu
- `PUT /api/admin/menus/:id` → MenuService.updateMenu
- `DELETE /api/admin/menus/:id` → MenuService.deleteMenu
- `PUT /api/admin/menus/reorder` → MenuService.reorderMenus
- `POST /api/admin/categories` → MenuService.createCategory
- `PUT /api/admin/categories/:id` → MenuService.updateCategory
- `DELETE /api/admin/categories/:id` → MenuService.deleteCategory
- `PUT /api/admin/categories/reorder` → MenuService.reorderCategories

### Order Routes
- `POST /api/orders` → OrderService.createOrder (table auth)
- `GET /api/orders` → OrderService.getOrdersBySession (table auth)
- `GET /api/admin/orders` → OrderService.getAllOrders (admin auth)
- `PUT /api/admin/orders/:id/status` → OrderService.updateOrderStatus (admin auth)
- `DELETE /api/admin/orders/:id` → OrderService.deleteOrder (admin auth)
- `GET /api/admin/orders/history` → OrderService.getOrderHistory (admin auth)

### Table Routes (Admin: auth middleware)
- `POST /api/admin/tables` → TableService.createTable
- `GET /api/admin/tables` → TableService.getTables
- `POST /api/admin/tables/:id/complete` → TableService.completeTable

### SSE Routes
- `GET /api/sse/orders` → SSEService (admin/table auth)

---

## Middleware
- `authMiddleware(requiredRole?) -> (req, res, next)`: JWT 검증, role 체크
