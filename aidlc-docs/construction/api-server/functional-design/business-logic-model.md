# Business Logic Model - API Server

## Auth Flow

```
[Admin Login]
  1. username + storeId로 admin 조회
  2. lockedUntil 확인 → 잠금 중이면 LOGIN_LOCKED 반환
  3. bcrypt.compare(password, passwordHash)
  4. 실패 → failedAttempts++ → 5회 도달 시 lockedUntil = now + 5min
  5. 성공 → failedAttempts = 0, lockedUntil = null → JWT 발급

[Table Login]
  1. storeId + tableNumber로 table 조회
  2. bcrypt.compare(password, passwordHash)
  3. 성공 → currentSessionId 없으면 새 sessionId 생성 → JWT 발급
```

## Order Flow

```
[주문 생성]
  1. JWT에서 tableId, sessionId 추출
  2. 테이블 세션 유효성 확인
  3. 각 item: menuId 존재 확인, 메뉴명/가격 스냅샷 복사
  4. totalAmount = SUM(price * quantity)
  5. orders + order_items INSERT
  6. 테이블 status가 inactive면 active로 전환
  7. SSE: order:created 발행 (admin + 해당 table)

[상태 변경]
  1. 현재 status 확인
  2. 전이 검증: pending→preparing, preparing→completed만 허용
  3. UPDATE status
  4. SSE: order:status-changed 발행

[주문 삭제]
  1. isDeleted = 1 UPDATE
  2. SSE: order:deleted 발행
```

## Table Complete Flow

```
[이용 완료]
  1. 해당 테이블의 현재 세션 주문 전체 조회 (isDeleted=0)
  2. 주문 데이터 JSON 직렬화
  3. order_history INSERT (ordersJson, totalAmount, completedAt)
  4. 해당 세션 orders + order_items DELETE (hard delete)
  5. table: currentSessionId = null, status = inactive
  6. SSE: table:completed 발행 (admin + 해당 table)
```

## Menu/Category CRUD Flow

```
[메뉴 등록/수정]
  1. 입력 검증 (nameKo, nameEn 필수, price >= 0, categoryId 존재)
  2. INSERT/UPDATE
  3. 등록 시 sortOrder = 현재 카테고리 내 MAX + 1

[카테고리 삭제]
  1. 하위 메뉴 존재 확인
  2. 있으면 VALIDATION_ERROR
  3. 없으면 DELETE

[순서 변경]
  1. ID 배열 수신
  2. 각 ID에 sortOrder = index 할당
  3. 일괄 UPDATE
```
