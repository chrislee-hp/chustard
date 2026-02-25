# Domain Entities - API Server

## Entity Relationship Diagram

```
Admin (1) ----< (N) LoginAttempt
Store (1) ----< (N) Table
Store (1) ----< (N) Category
Category (1) ----< (N) Menu
Table (1) ----< (N) TableSession
TableSession (1) ----< (N) Order
Order (1) ----< (N) OrderItem
Menu (1) ----< (N) OrderItem
```

---

## Entities

### Admin

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 관리자 ID |
| storeId | TEXT | FK, NOT NULL | 매장 ID |
| username | TEXT | NOT NULL, UNIQUE | 로그인 ID |
| passwordHash | TEXT | NOT NULL | bcrypt 해시 |
| createdAt | TEXT | NOT NULL | ISO8601 |

### Store

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 매장 ID |
| name | TEXT | NOT NULL | 매장명 |
| createdAt | TEXT | NOT NULL | ISO8601 |

### Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 테이블 ID |
| storeId | TEXT | FK, NOT NULL | 매장 ID |
| tableNumber | INTEGER | NOT NULL | 테이블 번호 |
| password | TEXT | NOT NULL | 4자리 PIN |
| status | TEXT | NOT NULL | active/inactive |
| currentSessionId | TEXT | FK, NULLABLE | 현재 세션 |
| createdAt | TEXT | NOT NULL | ISO8601 |

**Index**: `UNIQUE(storeId, tableNumber)`

### TableSession

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 세션 ID |
| tableId | TEXT | FK, NOT NULL | 테이블 ID |
| startedAt | TEXT | NOT NULL | 세션 시작 시간 |
| endedAt | TEXT | NULLABLE | 세션 종료 시간 |

### Category

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 카테고리 ID |
| storeId | TEXT | FK, NOT NULL | 매장 ID |
| name | TEXT | NOT NULL | 카테고리명 |
| sortOrder | INTEGER | NOT NULL, DEFAULT 0 | 정렬 순서 |
| createdAt | TEXT | NOT NULL | ISO8601 |

### Menu

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 메뉴 ID |
| categoryId | TEXT | FK, NOT NULL | 카테고리 ID |
| nameKo | TEXT | NOT NULL | 한국어 메뉴명 |
| nameEn | TEXT | NOT NULL | 영어 메뉴명 |
| descKo | TEXT | NULLABLE | 한국어 설명 |
| descEn | TEXT | NULLABLE | 영어 설명 |
| price | INTEGER | NOT NULL | 가격 (1,000~100,000) |
| imageUrl | TEXT | NULLABLE | 이미지 URL |
| sortOrder | INTEGER | NOT NULL, DEFAULT 0 | 정렬 순서 |
| createdAt | TEXT | NOT NULL | ISO8601 |

### Order

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 주문 번호 (순차) |
| sessionId | TEXT | FK, NOT NULL | 세션 ID |
| tableId | TEXT | FK, NOT NULL | 테이블 ID |
| status | TEXT | NOT NULL | pending/preparing/completed |
| totalAmount | INTEGER | NOT NULL | 총 금액 |
| deletedAt | TEXT | NULLABLE | Soft Delete 시간 |
| createdAt | TEXT | NOT NULL | ISO8601 |
| updatedAt | TEXT | NOT NULL | ISO8601 |

**Index**: `INDEX(sessionId)`, `INDEX(tableId, deletedAt)`

### OrderItem

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 항목 ID |
| orderId | INTEGER | FK, NOT NULL | 주문 ID |
| menuId | TEXT | FK, NOT NULL | 메뉴 ID |
| nameKo | TEXT | NOT NULL | 주문 시점 메뉴명(한) |
| nameEn | TEXT | NOT NULL | 주문 시점 메뉴명(영) |
| quantity | INTEGER | NOT NULL | 수량 (1~99) |
| price | INTEGER | NOT NULL | 주문 시점 단가 |

### LoginAttempt

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | 시도 ID |
| adminId | TEXT | FK, NOT NULL | 관리자 ID |
| attemptedAt | TEXT | NOT NULL | 시도 시간 |
| success | INTEGER | NOT NULL | 성공 여부 (0/1) |

**Index**: `INDEX(adminId, attemptedAt)`

---

## Seed Data

### Default Store
- id: `store-001`
- name: `테스트 매장`

### Default Admin
- storeId: `store-001`
- username: `admin`
- password: `admin1234` (bcrypt 해시 저장)
