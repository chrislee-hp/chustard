# Unit 1: API Server - Functional Design Plan

## Unit Context
- **Unit Name**: API Server (Backend)
- **Type**: Node.js 서버 (Express/Fastify)
- **Priority**: 1
- **Directory**: `server/`

## Assigned Stories
- US-1.1 테이블 자동 로그인
- US-1.2 메뉴 카테고리 탐색
- US-1.5 주문 생성
- US-1.6 주문 내역 조회
- US-1.8 세션 만료 안내
- US-2.1 관리자 로그인
- US-2.2 실시간 주문 모니터링
- US-2.3 주문 상세/상태 변경
- US-2.4 테이블 초기 설정
- US-2.5 주문 삭제
- US-2.6 테이블 이용 완료
- US-2.7 과거 주문 내역
- US-2.8 메뉴 관리
- US-2.9 카테고리 관리

---

## Clarification Questions

### Q1: 주문 번호 생성 규칙
주문 번호는 어떤 형식으로 생성하시겠습니까?

A) 순차 번호 (1, 2, 3, ...)
B) 날짜 기반 (20260225-001, 20260225-002, ...)
C) UUID (랜덤 고유 ID)
D) 테이블 번호 포함 (T01-001, T01-002, ...)

[Answer]:  A 
---

### Q2: 주문 상태 전환 규칙
주문 상태 전환 시 역방향 전환(예: 완료→준비중)을 허용하시겠습니까?

A) 순방향만 허용 (대기중→준비중→완료)
B) 역방향도 허용 (완료→준비중 가능)
C) 특정 상태만 역방향 허용 (예: 준비중↔대기중만 가능)

[Answer]: A

---

### Q3: 테이블 세션 ID 생성 규칙
테이블 세션 ID는 어떻게 생성하시겠습니까?

A) UUID (랜덤 고유 ID)
B) 테이블 번호 + 타임스탬프 (T01-1709012345678)
C) 순차 번호 (SESSION-001, SESSION-002, ...)

[Answer]: A

---

### Q4: 동시 주문 처리
같은 테이블에서 동시에 여러 주문이 생성될 수 있습니까?

A) 가능 (동시 주문 허용)
B) 불가능 (이전 주문 완료 후 다음 주문 가능)
C) 제한적 허용 (예: 5초 이내 중복 주문 방지)

[Answer]: A

---

### Q5: 메뉴 이미지 URL 검증
메뉴 이미지 URL 입력 시 URL 유효성 검증을 수행하시겠습니까?

A) URL 형식만 검증 (http/https로 시작)
B) 실제 이미지 존재 여부까지 검증 (HTTP HEAD 요청)
C) 검증 없음 (입력값 그대로 저장)

[Answer]: B

---

### Q6: 카테고리 삭제 시 메뉴 처리
카테고리 삭제 시 해당 카테고리의 메뉴는 어떻게 처리하시겠습니까?

A) 삭제 불가 (메뉴가 있으면 카테고리 삭제 차단)
B) 메뉴도 함께 삭제 (Cascade Delete)
C) 메뉴를 "미분류" 카테고리로 이동

[Answer]: A

---

### Q7: 주문 삭제 시 처리 방식
관리자가 주문을 삭제할 때 실제 삭제(Hard Delete)와 소프트 삭제(Soft Delete) 중 어느 방식을 사용하시겠습니까?

A) Hard Delete (DB에서 완전 삭제)
B) Soft Delete (deleted_at 플래그 설정, 데이터 보존)

[Answer]: B

---

### Q8: JWT 토큰 갱신 정책
관리자/테이블 JWT 토큰이 만료되기 전 자동 갱신을 지원하시겠습니까?

A) 자동 갱신 지원 (만료 1시간 전 자동 갱신)
B) 자동 갱신 없음 (만료 시 재로그인 필요)
C) Refresh Token 방식 (Access Token + Refresh Token)

[Answer]: A

---

### Q9: SSE 연결 끊김 처리
SSE 연결이 끊겼을 때 클라이언트 재연결 시 누락된 이벤트를 어떻게 처리하시겠습니까?

A) 재연결 시 최신 상태만 전송 (누락 이벤트 무시)
B) 재연결 시 누락된 이벤트 모두 전송 (이벤트 버퍼링)
C) 재연결 시 전체 데이터 재전송 (Full Refresh)

[Answer]: A

---

### Q10: 테이블 비밀번호 정책
테이블 비밀번호는 어떤 형식으로 설정하시겠습니까?

A) 4자리 숫자 PIN (예: 1234)
B) 6자리 이상 영숫자 (예: table01)
C) 제한 없음 (관리자가 자유롭게 설정)

[Answer]: A

---

### Q11: 메뉴 가격 범위
메뉴 가격의 최소/최대 범위를 설정하시겠습니까?

A) 범위 설정 (예: 최소 1,000원, 최대 100,000원)
B) 최소값만 설정 (예: 0원 이상)
C) 제한 없음

[Answer]: A

---

### Q12: 과거 주문 내역 보관 기간
과거 주문 내역은 얼마나 보관하시겠습니까?

A) 영구 보관
B) 기간 제한 (예: 3개월, 6개월, 1년)
C) 수동 삭제만 가능

[Answer]: A

---

## Execution Plan

### Step 1: Domain Entities 정의
- [x] 핵심 Entity 식별 (Store, Table, Menu, Category, Order, OrderItem, Admin, TableSession)
- [x] Entity 간 관계 정의 (1:N, N:M)
- [x] 각 Entity의 속성 및 타입 정의
- [x] Primary Key, Foreign Key 정의
- [x] 인덱스 전략 정의

### Step 2: Business Logic Model 설계
- [x] 인증/인가 로직 (JWT 생성, 검증, 갱신)
- [x] 테이블 세션 라이프사이클 (생성, 활성화, 종료)
- [x] 주문 생성 및 검증 로직
- [x] 주문 상태 전환 로직 및 규칙
- [x] 메뉴/카테고리 CRUD 로직
- [x] SSE 이벤트 발행 로직
- [x] 데이터 조회 및 필터링 로직

### Step 3: Business Rules 정의
- [x] 주문 생성 검증 규칙 (메뉴 존재, 수량 범위, 가격 계산)
- [x] 주문 상태 전환 규칙 (허용/불허용 전환)
- [x] 테이블 세션 검증 규칙 (활성 세션 확인)
- [x] 관리자 로그인 제한 규칙 (5회 실패 시 5분 차단)
- [x] 메뉴/카테고리 삭제 규칙 (연관 데이터 처리)
- [x] JWT 토큰 만료 및 갱신 규칙
- [x] 입력 데이터 검증 규칙 (필수 필드, 형식, 범위)

### Step 4: Data Flow 설계
- [x] 고객 주문 플로우 (메뉴 조회 → 장바구니 → 주문 생성 → 주문 내역)
- [x] 관리자 주문 관리 플로우 (모니터링 → 상태 변경 → 완료)
- [x] 테이블 세션 플로우 (초기 설정 → 주문 누적 → 이용 완료)
- [x] SSE 이벤트 플로우 (이벤트 발생 → 구독자 필터링 → 전송)
- [x] 인증 플로우 (로그인 → JWT 발급 → 검증 → 갱신)

### Step 5: Error Handling 전략
- [x] HTTP 상태 코드 정의 (200, 201, 400, 401, 403, 404, 500)
- [x] 에러 응답 형식 정의 (code, message, details)
- [x] 비즈니스 에러 코드 정의 (INVALID_ORDER, SESSION_EXPIRED, etc.)
- [x] 검증 실패 에러 처리
- [x] DB 에러 처리 (중복 키, 외래 키 제약)
- [x] SSE 연결 에러 처리

---

## Artifacts to Generate

1. **domain-entities.md**: Entity 정의, 관계, 속성, 제약조건
2. **business-logic-model.md**: 비즈니스 로직 흐름, 알고리즘, 데이터 변환
3. **business-rules.md**: 검증 규칙, 상태 전환 규칙, 제약 조건
