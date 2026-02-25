# Test Plan - API Server

## Unit Overview
- **Unit**: api-server
- **Stories**: US-1.1~1.8, US-2.1~2.9
- **Tech**: Node.js, Express, SQLite, Jest

---

## Repository Layer Tests

### AdminRepository
- **TC-R-001**: findByStoreAndUsername - 존재하는 admin 반환
  - Given: admin 레코드 존재
  - When: findByStoreAndUsername 호출
  - Then: admin 객체 반환
  - Status: ⬜

- **TC-R-002**: findByStoreAndUsername - 없으면 null
  - Given: 해당 admin 없음
  - When: findByStoreAndUsername 호출
  - Then: null 반환
  - Status: ⬜

### TableRepository
- **TC-R-003**: create - 테이블 생성
  - Given: 유효한 테이블 데이터
  - When: create 호출
  - Then: 생성된 테이블 반환 (id 포함)
  - Status: ⬜

- **TC-R-004**: findByStoreAndNumber - 존재하는 테이블 반환
  - Status: ⬜

- **TC-R-005**: findAllByStore - 매장 전체 테이블 목록
  - Status: ⬜

- **TC-R-006**: updateSession - 세션 ID/상태 업데이트
  - Status: ⬜

### CategoryRepository
- **TC-R-007**: create - 카테고리 생성
  - Status: ⬜

- **TC-R-008**: findAllByStore - 정렬 순서대로 반환
  - Status: ⬜

- **TC-R-009**: update - 카테고리명 수정
  - Status: ⬜

- **TC-R-010**: delete - 카테고리 삭제
  - Status: ⬜

- **TC-R-011**: updateSortOrders - 순서 일괄 변경
  - Status: ⬜

- **TC-R-012**: countMenus - 하위 메뉴 수 반환
  - Status: ⬜

### MenuRepository
- **TC-R-013**: create - 메뉴 생성
  - Status: ⬜

- **TC-R-014**: findAllByStoreGrouped - 카테고리별 그룹화 반환
  - Status: ⬜

- **TC-R-015**: update - 메뉴 수정
  - Status: ⬜

- **TC-R-016**: delete - 메뉴 삭제
  - Status: ⬜

- **TC-R-017**: updateSortOrders - 메뉴 순서 변경
  - Status: ⬜

### OrderRepository
- **TC-R-018**: create - 주문+항목 생성
  - Given: 유효한 주문 데이터
  - When: create 호출
  - Then: 주문 + order_items 함께 저장
  - Status: ⬜

- **TC-R-019**: findByTableSession - 세션별 주문 조회 (삭제 제외)
  - Status: ⬜

- **TC-R-020**: findAllByStore - 테이블별 그룹화 조회
  - Status: ⬜

- **TC-R-021**: updateStatus - 상태 변경
  - Status: ⬜

- **TC-R-022**: softDelete - isDeleted=1 처리
  - Status: ⬜

- **TC-R-023**: deleteBySession - 세션 주문 hard delete
  - Status: ⬜

### OrderHistoryRepository
- **TC-R-024**: create - 이력 저장
  - Status: ⬜

- **TC-R-025**: findByFilters - 필터 조회 (tableId, date)
  - Status: ⬜

---

## Service Layer Tests

### AuthService
- **TC-S-001**: adminLogin - 성공 시 JWT 반환
  - Given: 유효한 자격 증명
  - When: adminLogin 호출
  - Then: { token, expiresIn: 57600 } 반환
  - Story: US-2.1
  - Status: ⬜

- **TC-S-002**: adminLogin - 잘못된 비밀번호 시 UNAUTHORIZED
  - Story: US-2.1
  - Status: ⬜

- **TC-S-003**: adminLogin - 5회 실패 후 LOGIN_LOCKED
  - Given: failedAttempts=4
  - When: 한 번 더 실패
  - Then: LOGIN_LOCKED, lockedUntil 설정
  - Story: US-2.1
  - Status: ⬜

- **TC-S-004**: adminLogin - 잠금 중 로그인 시도 거부
  - Story: US-2.1
  - Status: ⬜

- **TC-S-005**: adminLogin - 성공 시 failedAttempts 초기화
  - Story: US-2.1
  - Status: ⬜

- **TC-S-006**: tableLogin - 성공 시 token + sessionId 반환
  - Story: US-1.1
  - Status: ⬜

- **TC-S-007**: tableLogin - 기존 세션 있으면 동일 sessionId 반환
  - Story: US-1.1
  - Status: ⬜

- **TC-S-008**: verifyToken - 유효한 토큰 검증
  - Status: ⬜

- **TC-S-009**: verifyToken - 만료 토큰 UNAUTHORIZED
  - Status: ⬜

### MenuService
- **TC-S-010**: getMenus - 카테고리별 그룹화 반환
  - Story: US-1.2
  - Status: ⬜

- **TC-S-011**: createMenu - 메뉴 생성 + sortOrder 자동 할당
  - Story: US-2.8
  - Status: ⬜

- **TC-S-012**: deleteCategory - 하위 메뉴 있으면 VALIDATION_ERROR
  - Story: US-2.9
  - Status: ⬜

- **TC-S-013**: deleteCategory - 하위 메뉴 없으면 삭제 성공
  - Story: US-2.9
  - Status: ⬜

- **TC-S-014**: reorderMenus - sortOrder 재할당
  - Story: US-2.8
  - Status: ⬜

### OrderService
- **TC-S-015**: createOrder - 주문 생성 + 메뉴 스냅샷 복사
  - Given: 유효한 items
  - When: createOrder 호출
  - Then: order_items에 메뉴명/가격 스냅샷 저장
  - Story: US-1.5
  - Status: ⬜

- **TC-S-016**: createOrder - 테이블 inactive→active 전환
  - Story: US-1.5
  - Status: ⬜

- **TC-S-017**: createOrder - SSE order:created 발행
  - Story: US-1.5, US-2.2
  - Status: ⬜

- **TC-S-018**: updateOrderStatus - pending→preparing 성공
  - Story: US-2.3
  - Status: ⬜

- **TC-S-019**: updateOrderStatus - pending→completed 거부 (잘못된 전이)
  - Story: US-2.3
  - Status: ⬜

- **TC-S-020**: updateOrderStatus - SSE order:status-changed 발행
  - Story: US-2.3, US-1.6
  - Status: ⬜

- **TC-S-021**: deleteOrder - 소프트 삭제 + SSE 발행
  - Story: US-2.5
  - Status: ⬜

### TableService
- **TC-S-022**: createTable - 테이블 생성
  - Story: US-2.4
  - Status: ⬜

- **TC-S-023**: createTable - 중복 번호 VALIDATION_ERROR
  - Story: US-2.4
  - Status: ⬜

- **TC-S-024**: completeTable - 주문→이력 이동 + 세션 리셋 + SSE
  - Given: active 테이블, 주문 2건
  - When: completeTable 호출
  - Then: order_history 저장, orders 삭제, status=inactive, SSE table:completed
  - Story: US-2.6
  - Status: ⬜

### SSEService
- **TC-S-025**: addClient/removeClient - 클라이언트 등록/해제
  - Status: ⬜

- **TC-S-026**: broadcast - admin은 매장 전체, customer는 테이블만
  - Story: US-1.6, US-2.2
  - Status: ⬜

---

## API Layer Tests

### Auth Routes
- **TC-A-001**: POST /api/admin/login - 200 성공
  - Status: ⬜

- **TC-A-002**: POST /api/admin/login - 401 실패
  - Status: ⬜

- **TC-A-003**: POST /api/table/login - 200 성공
  - Status: ⬜

- **TC-A-004**: GET /api/auth/verify - 200 유효 토큰
  - Status: ⬜

- **TC-A-005**: GET /api/auth/verify - 401 만료 토큰
  - Status: ⬜

### Menu Routes
- **TC-A-006**: GET /api/menus - 200 메뉴 목록
  - Status: ⬜

- **TC-A-007**: POST /api/admin/menus - 201 생성
  - Status: ⬜

- **TC-A-008**: POST /api/admin/menus - 401 인증 없음
  - Status: ⬜

- **TC-A-009**: DELETE /api/admin/categories/:id - 400 하위 메뉴 존재
  - Status: ⬜

### Order Routes
- **TC-A-010**: POST /api/orders - 201 주문 생성
  - Status: ⬜

- **TC-A-011**: POST /api/orders - 401 인증 없음
  - Status: ⬜

- **TC-A-012**: GET /api/orders - 200 세션 주문 조회
  - Status: ⬜

- **TC-A-013**: PUT /api/admin/orders/:id/status - 200 상태 변경
  - Status: ⬜

- **TC-A-014**: PUT /api/admin/orders/:id/status - 400 잘못된 전이
  - Status: ⬜

- **TC-A-015**: DELETE /api/admin/orders/:id - 200 삭제
  - Status: ⬜

### Table Routes
- **TC-A-016**: POST /api/admin/tables - 201 생성
  - Status: ⬜

- **TC-A-017**: POST /api/admin/tables/:id/complete - 200 이용 완료
  - Status: ⬜

### SSE Route
- **TC-A-018**: GET /api/sse/orders - SSE 연결 수립
  - Status: ⬜

---

## Coverage Summary

| Story | Test Cases | Count |
|---|---|---|
| US-1.1 | TC-S-006, TC-S-007, TC-A-003 | 3 |
| US-1.2 | TC-S-010, TC-A-006 | 2 |
| US-1.5 | TC-S-015~017, TC-A-010~011 | 5 |
| US-1.6 | TC-S-020, TC-S-026, TC-A-012 | 3 |
| US-2.1 | TC-S-001~005, TC-A-001~002 | 7 |
| US-2.2 | TC-S-017, TC-S-026, TC-A-018 | 3 |
| US-2.3 | TC-S-018~020, TC-A-013~014 | 5 |
| US-2.4 | TC-S-022~023, TC-A-016 | 3 |
| US-2.5 | TC-S-021, TC-A-015 | 2 |
| US-2.6 | TC-S-024, TC-A-017 | 2 |
| US-2.8 | TC-S-011, TC-S-014, TC-A-007~008 | 4 |
| US-2.9 | TC-S-012~013, TC-A-009 | 3 |

**Total**: 69 test cases (Repository 25 + Service 26 + API 18)
