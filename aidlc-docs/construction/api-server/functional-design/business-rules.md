# Business Rules - API Server

## BR-1: 인증

| ID | Rule | Detail |
|---|---|---|
| BR-1.1 | 관리자 로그인 실패 제한 | 5회 연속 실패 → 5분 잠금. lockedUntil 이전 요청은 즉시 거부 |
| BR-1.2 | 로그인 성공 시 초기화 | failedAttempts = 0, lockedUntil = null |
| BR-1.3 | JWT 만료 | 16시간 (57600초) |
| BR-1.4 | 비밀번호 저장 | bcrypt 해시 (salt rounds: 10) |
| BR-1.5 | 테이블 로그인 세션 | 첫 로그인 시 sessionId 생성, 이후 동일 테이블은 기존 sessionId 반환 |

## BR-2: 주문

| ID | Rule | Detail |
|---|---|---|
| BR-2.1 | 상태 전이 | pending → preparing → completed (순차만 허용, 역방향 불가) |
| BR-2.2 | 소프트 삭제 | isDeleted = 1, 조회 시 제외. 대시보드 총액 재계산 |
| BR-2.3 | 주문 생성 검증 | 세션 유효성 + 메뉴 존재 + 수량 >= 1 + 가격 > 0 |
| BR-2.4 | 주문 항목 스냅샷 | 주문 시점의 메뉴명/가격을 order_items에 복사 (메뉴 변경 영향 차단) |
| BR-2.5 | totalAmount 계산 | SUM(price × quantity) for all items |

## BR-3: 테이블

| ID | Rule | Detail |
|---|---|---|
| BR-3.1 | 이용 완료 처리 | 현재 세션 주문 → order_history로 JSON 스냅샷 이동 → 주문 삭제 → sessionId 리셋 → status = inactive |
| BR-3.2 | 테이블 번호 유일성 | 동일 매장 내 tableNumber UNIQUE |
| BR-3.3 | 테이블 상태 전환 | 첫 주문 시 inactive → active, 이용 완료 시 active → inactive |

## BR-4: 메뉴/카테고리

| ID | Rule | Detail |
|---|---|---|
| BR-4.1 | 순서 변경 | 전달받은 ID 배열 순서대로 sortOrder 재할당 (0, 1, 2, ...) |
| BR-4.2 | 카테고리 삭제 | 하위 메뉴가 있으면 삭제 불가 (VALIDATION_ERROR) |
| BR-4.3 | 다국어 필수 | nameKo, nameEn 필수. descKo, descEn 선택 |

## BR-5: SSE

| ID | Rule | Detail |
|---|---|---|
| BR-5.1 | Admin scope | storeId 기준 매장 전체 이벤트 수신 |
| BR-5.2 | Customer scope | tableId 기준 해당 테이블 이벤트만 수신 |
| BR-5.3 | 연결 해제 | 클라이언트 disconnect 시 연결 목록에서 제거 |
| BR-5.4 | 이벤트 발행 시점 | 주문 생성/상태변경/삭제/테이블완료 시 즉시 발행 |
