# API Contract - Table Order Service

모든 Unit(API Server, Customer SPA, Admin SPA)이 병렬 개발 시 참조하는 공통 API 계약입니다.

## Base URL

```
http://localhost:3000/api
```

## Authentication

| Type | Header | Format | 용도 |
|---|---|---|---|
| Admin JWT | `Authorization` | `Bearer <token>` | 관리자 API |
| Table JWT | `Authorization` | `Bearer <token>` | 고객 API |

JWT Payload:
- Admin: `{ role: "admin", storeId, adminId, exp }`
- Table: `{ role: "table", storeId, tableId, sessionId, exp }`

---

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "설명 메시지"
  }
}
```

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `UNAUTHORIZED` | 401 | 인증 실패 / 토큰 만료 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `LOGIN_LOCKED` | 423 | 로그인 5회 실패, 5분 잠금 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## 1. Auth API

### POST /api/admin/login

관리자 로그인

**Request**:
```json
{
  "storeId": "string",
  "username": "string",
  "password": "string"
}
```

**Response 200**:
```json
{
  "token": "jwt-string",
  "expiresIn": 57600
}
```

**Errors**: `UNAUTHORIZED`, `LOGIN_LOCKED`, `VALIDATION_ERROR`

---

### POST /api/table/login

테이블 태블릿 로그인

**Request**:
```json
{
  "storeId": "string",
  "tableNumber": 1,
  "password": "string"
}
```

**Response 200**:
```json
{
  "token": "jwt-string",
  "tableId": "string",
  "sessionId": "string"
}
```

**Errors**: `UNAUTHORIZED`, `VALIDATION_ERROR`

---

### GET /api/auth/verify

토큰 검증

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "valid": true,
  "role": "admin | table",
  "tableId": "string | null"
}
```

**Errors**: `UNAUTHORIZED`

---

## 2. Menu API

### GET /api/menus?storeId={storeId}

카테고리별 메뉴 전체 조회 (고객/관리자 공용)

**Response 200**:
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "sortOrder": 0,
      "menus": [
        {
          "id": "string",
          "nameKo": "string",
          "nameEn": "string",
          "descKo": "string",
          "descEn": "string",
          "price": 10000,
          "imageUrl": "string",
          "sortOrder": 0
        }
      ]
    }
  ]
}
```

---

### POST /api/admin/menus 🔒 Admin

메뉴 등록

**Request**:
```json
{
  "nameKo": "string",
  "nameEn": "string",
  "descKo": "string",
  "descEn": "string",
  "price": 10000,
  "categoryId": "string",
  "imageUrl": "string"
}
```

**Response 201**:
```json
{ "menu": { "id": "string", "...": "..." } }
```

---

### PUT /api/admin/menus/:id 🔒 Admin

메뉴 수정 (Request/Response: POST와 동일 구조)

---

### DELETE /api/admin/menus/:id 🔒 Admin

메뉴 삭제

**Response 200**: `{ "success": true }`

---

### PUT /api/admin/menus/reorder 🔒 Admin

메뉴 순서 변경

**Request**:
```json
{ "menuIds": ["id1", "id2", "id3"] }
```

**Response 200**: `{ "success": true }`

---

### POST /api/admin/categories 🔒 Admin

카테고리 등록

**Request**: `{ "name": "string" }`

**Response 201**: `{ "category": { "id": "string", "name": "string", "sortOrder": 0 } }`

---

### PUT /api/admin/categories/:id 🔒 Admin

카테고리 수정

**Request**: `{ "name": "string" }`

**Response 200**: `{ "category": { "id": "string", "name": "string", "sortOrder": 0 } }`

---

### DELETE /api/admin/categories/:id 🔒 Admin

카테고리 삭제

**Response 200**: `{ "success": true }`

---

### PUT /api/admin/categories/reorder 🔒 Admin

카테고리 순서 변경

**Request**: `{ "categoryIds": ["id1", "id2"] }`

**Response 200**: `{ "success": true }`

---

## 3. Order API

### POST /api/orders 🔒 Table

주문 생성

**Request**:
```json
{
  "tableId": "string",
  "sessionId": "string",
  "items": [
    { "menuId": "string", "quantity": 1, "price": 10000 }
  ]
}
```

**Response 201**:
```json
{
  "order": {
    "id": "string",
    "tableId": "string",
    "sessionId": "string",
    "status": "pending",
    "totalAmount": 10000,
    "items": [
      { "menuId": "string", "nameKo": "string", "nameEn": "string", "quantity": 1, "price": 10000 }
    ],
    "createdAt": "ISO8601"
  }
}
```

**Errors**: `VALIDATION_ERROR`, `UNAUTHORIZED`

---

### GET /api/orders?tableId={tableId}&sessionId={sessionId} 🔒 Table

테이블 세션별 주문 조회

**Response 200**:
```json
{
  "orders": [
    {
      "id": "string",
      "status": "pending | preparing | completed",
      "totalAmount": 10000,
      "items": [ "..." ],
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### GET /api/admin/orders?storeId={storeId} 🔒 Admin

전체 테이블 주문 조회 (대시보드)

**Response 200**:
```json
{
  "tables": [
    {
      "tableId": "string",
      "tableNumber": 1,
      "status": "active | inactive",
      "orders": [ "..." ],
      "totalAmount": 50000
    }
  ]
}
```

---

### PUT /api/admin/orders/:id/status 🔒 Admin

주문 상태 변경 (순차: pending → preparing → completed)

**Request**: `{ "status": "preparing | completed" }`

**Response 200**: `{ "order": { "..." } }`

**Errors**: `VALIDATION_ERROR` (잘못된 상태 전이)

---

### DELETE /api/admin/orders/:id 🔒 Admin

주문 소프트 삭제

**Response 200**: `{ "success": true }`

---

### GET /api/admin/orders/history?tableId={tableId}&date={YYYY-MM-DD} 🔒 Admin

과거 주문 내역 조회

**Response 200**:
```json
{
  "history": [
    {
      "sessionId": "string",
      "tableNumber": 1,
      "orders": [ "..." ],
      "totalAmount": 50000,
      "completedAt": "ISO8601"
    }
  ]
}
```

---

## 4. Table API

### POST /api/admin/tables 🔒 Admin

테이블 초기 설정

**Request**: `{ "tableNumber": 1, "password": "string" }`

**Response 201**: `{ "table": { "id": "string", "tableNumber": 1, "status": "inactive" } }`

---

### GET /api/admin/tables?storeId={storeId} 🔒 Admin

테이블 목록 조회

**Response 200**:
```json
{
  "tables": [
    { "id": "string", "tableNumber": 1, "status": "active | inactive", "currentSessionId": "string | null" }
  ]
}
```

---

### POST /api/admin/tables/:id/complete 🔒 Admin

테이블 이용 완료 (세션 종료, 주문 이력 이동)

**Response 200**: `{ "success": true }`

---

## 5. SSE API

### GET /api/sse/orders?storeId={storeId} 🔒 Admin

### GET /api/sse/orders?tableId={tableId} 🔒 Table

실시간 주문 이벤트 스트림

**Content-Type**: `text/event-stream`

**Event Types**:

```
event: order:created
data: { "order": { "id", "tableId", "status", "items", "totalAmount", "createdAt" } }

event: order:status-changed
data: { "orderId": "string", "status": "preparing | completed" }

event: order:deleted
data: { "orderId": "string" }

event: table:completed
data: { "tableId": "string" }
```

**Scope**:
- Admin (`storeId`): 매장 전체 이벤트 수신
- Customer (`tableId`): 해당 테이블 이벤트만 수신

---

## Status Enums

**Order Status**: `pending` → `preparing` → `completed`

**Table Status**: `active` (세션 진행 중) | `inactive` (세션 없음)

**Order Status Display (i18n)**:
| Status | 한국어 | English |
|---|---|---|
| pending | 대기중 | Pending |
| preparing | 준비중 | Preparing |
| completed | 완료 | Completed |
