# Domain Entities - API Server

## ER Diagram

```
stores 1──* admins
stores 1──* tables
stores 1──* categories
categories 1──* menus
tables 1──* orders
orders 1──* order_items
order_items *──1 menus
tables 1──* order_history
```

## Entity Definitions

### Store

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 매장 ID |
| name | TEXT | NOT NULL | 매장명 |
| createdAt | TEXT (ISO8601) | NOT NULL | 생성일시 |

---

### Admin

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 관리자 ID |
| storeId | TEXT | FK → stores.id, NOT NULL | 매장 ID |
| username | TEXT | NOT NULL, UNIQUE per store | 로그인 ID |
| passwordHash | TEXT | NOT NULL | bcrypt 해시 |
| failedAttempts | INTEGER | DEFAULT 0 | 연속 실패 횟수 |
| lockedUntil | TEXT | NULLABLE | 잠금 해제 시각 |
| createdAt | TEXT | NOT NULL | 생성일시 |

---

### Table

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 테이블 ID |
| storeId | TEXT | FK → stores.id, NOT NULL | 매장 ID |
| tableNumber | INTEGER | NOT NULL, UNIQUE per store | 테이블 번호 |
| passwordHash | TEXT | NOT NULL | bcrypt 해시 |
| status | TEXT | DEFAULT 'inactive' | active / inactive |
| currentSessionId | TEXT | NULLABLE | 현재 세션 ID |
| createdAt | TEXT | NOT NULL | 생성일시 |

---

### Category

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 카테고리 ID |
| storeId | TEXT | FK → stores.id, NOT NULL | 매장 ID |
| name | TEXT | NOT NULL | 카테고리명 |
| sortOrder | INTEGER | DEFAULT 0 | 정렬 순서 |
| createdAt | TEXT | NOT NULL | 생성일시 |

---

### Menu

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 메뉴 ID |
| categoryId | TEXT | FK → categories.id, NOT NULL | 카테고리 ID |
| nameKo | TEXT | NOT NULL | 메뉴명 (한국어) |
| nameEn | TEXT | NOT NULL | 메뉴명 (영어) |
| descKo | TEXT | DEFAULT '' | 설명 (한국어) |
| descEn | TEXT | DEFAULT '' | 설명 (영어) |
| price | INTEGER | NOT NULL, >= 0 | 가격 (원) |
| imageUrl | TEXT | DEFAULT '' | 이미지 URL |
| sortOrder | INTEGER | DEFAULT 0 | 정렬 순서 |
| createdAt | TEXT | NOT NULL | 생성일시 |

---

### Order

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 주문 ID |
| tableId | TEXT | FK → tables.id, NOT NULL | 테이블 ID |
| sessionId | TEXT | NOT NULL | 세션 ID |
| status | TEXT | DEFAULT 'pending' | pending / preparing / completed |
| totalAmount | INTEGER | NOT NULL | 총 금액 |
| isDeleted | INTEGER | DEFAULT 0 | 소프트 삭제 (0/1) |
| createdAt | TEXT | NOT NULL | 생성일시 |

---

### OrderItem

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 항목 ID |
| orderId | TEXT | FK → orders.id, NOT NULL | 주문 ID |
| menuId | TEXT | FK → menus.id, NOT NULL | 메뉴 ID |
| nameKo | TEXT | NOT NULL | 주문 시점 메뉴명 (한국어) |
| nameEn | TEXT | NOT NULL | 주문 시점 메뉴명 (영어) |
| price | INTEGER | NOT NULL | 주문 시점 가격 |
| quantity | INTEGER | NOT NULL, >= 1 | 수량 |

---

### OrderHistory

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | TEXT (UUID) | PK | 이력 ID |
| storeId | TEXT | NOT NULL | 매장 ID |
| tableNumber | INTEGER | NOT NULL | 테이블 번호 |
| sessionId | TEXT | NOT NULL | 세션 ID |
| ordersJson | TEXT (JSON) | NOT NULL | 주문 데이터 스냅샷 |
| totalAmount | INTEGER | NOT NULL | 세션 총 금액 |
| completedAt | TEXT | NOT NULL | 이용 완료 시각 |
