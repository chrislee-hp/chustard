# Business Logic Model - API Server

## 1. AuthService Logic

### adminLogin(storeId, username, password)
```
1. Admin 조회 (storeId, username)
2. 없으면 → UNAUTHORIZED
3. 로그인 차단 확인:
   - 최근 5분 내 실패 횟수 조회
   - >= 5 → LOGIN_LOCKED
4. 비밀번호 검증 (bcrypt.compare)
5. 실패 → LoginAttempt 기록 (success=0) → UNAUTHORIZED
6. 성공 → LoginAttempt 기록 (success=1)
7. JWT 생성 (role=admin, storeId, adminId, exp=16h)
8. 반환: { token, expiresIn: 57600 }
```

### tableLogin(storeId, tableNumber, password)
```
1. Table 조회 (storeId, tableNumber)
2. 없으면 → UNAUTHORIZED
3. 비밀번호 검증 (평문 비교, 4자리 PIN)
4. 실패 → UNAUTHORIZED
5. 세션 확인/생성:
   - currentSessionId 있으면 기존 세션 사용
   - 없으면 새 세션 생성 (UUID), Table.currentSessionId 업데이트
6. JWT 생성 (role=table, storeId, tableId, sessionId, exp=24h)
7. 반환: { token, tableId, sessionId }
```

### verifyToken(token)
```
1. JWT 디코딩
2. 만료 확인
3. 자동 갱신 판정: exp - now < 1h → 새 토큰 발급
4. 반환: { valid, role, tableId?, newToken? }
```

---

## 2. MenuService Logic

### getMenus(storeId)
```
1. Category 조회 (storeId, ORDER BY sortOrder)
2. 각 Category별 Menu 조회 (ORDER BY sortOrder)
3. 그룹화하여 반환
```

### createMenu(data)
```
1. 입력 검증 (nameKo, nameEn, price, categoryId)
2. 가격 범위 검증 (1000~100000)
3. imageUrl 검증 (있으면 HEAD 요청)
4. Category 존재 확인
5. Menu 저장 (UUID 생성, sortOrder = MAX+1)
6. 반환: menu
```

### deleteCategory(categoryId)
```
1. Category 존재 확인
2. 해당 Category의 Menu 개수 조회
3. > 0 → VALIDATION_ERROR (CATEGORY_HAS_MENUS)
4. Category 삭제
```

---

## 3. OrderService Logic

### createOrder(tableId, sessionId, items)
```
1. 세션 유효성 확인 (Table.currentSessionId == sessionId)
2. 각 item의 Menu 존재 확인
3. 수량 검증 (1~99)
4. totalAmount 계산: SUM(item.price * item.quantity)
5. Order 저장 (status=pending)
6. OrderItem 저장 (메뉴명 스냅샷 포함)
7. SSE 발행: order:created
8. 반환: order
```

### updateOrderStatus(orderId, newStatus)
```
1. Order 조회
2. 상태 전환 검증:
   - pending → preparing ✓
   - preparing → completed ✓
   - 그 외 → VALIDATION_ERROR
3. Order.status 업데이트
4. SSE 발행: order:status-changed
5. 반환: order
```

### deleteOrder(orderId)
```
1. Order 조회
2. deletedAt = NOW() 설정 (Soft Delete)
3. SSE 발행: order:deleted
```

### getOrdersBySession(tableId, sessionId)
```
1. Order 조회 (sessionId, deletedAt IS NULL)
2. 각 Order의 OrderItem 조회
3. 반환: orders[]
```

---

## 4. TableService Logic

### createTable(storeId, tableNumber, password)
```
1. 비밀번호 형식 검증 (4자리 숫자)
2. 중복 확인 (storeId, tableNumber)
3. Table 저장 (status=inactive)
4. 반환: table
```

### completeTable(tableId)
```
1. Table 조회
2. currentSessionId 없으면 → 이미 완료 상태
3. 세션 종료: TableSession.endedAt = NOW()
4. Table 업데이트: currentSessionId = NULL, status = inactive
5. SSE 발행: table:completed
```

---

## 5. SSEService Logic

### subscribe(clientId, role, storeId?, tableId?)
```
1. 연결 정보 저장: { clientId, role, storeId, tableId, response }
2. Keep-alive 설정 (30초 간격 ping)
```

### broadcast(eventType, data, scope)
```
1. scope에 따라 대상 필터링:
   - storeId → 해당 매장 admin 클라이언트
   - tableId → 해당 테이블 customer 클라이언트
2. 각 대상에 SSE 이벤트 전송
```

### unsubscribe(clientId)
```
1. 연결 정보 제거
```
