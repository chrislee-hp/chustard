# Integration Test Instructions

## Purpose
API Server ↔ Customer SPA ↔ Admin SPA 간 상호작용 검증

## Setup

### 1. Start API Server
```bash
cd server && node src/index.js
# http://localhost:3000
```

### 2. Start Customer SPA (Dev)
```bash
cd client/customer && npx vite
# http://localhost:5173 (proxy → :3000)
```

### 3. Start Admin SPA (Dev)
```bash
cd client/admin && npx vite
# http://localhost:5174 (proxy → :3000)
```

## Test Scenarios

### Scenario 1: 관리자 로그인 → 메뉴 등록
1. Admin SPA (`/login`)에서 관리자 로그인
2. 메뉴 관리 페이지에서 카테고리 추가
3. 메뉴 항목 추가
4. Customer SPA에서 메뉴 목록 확인

### Scenario 2: 고객 주문 → 관리자 확인
1. Customer SPA에서 테이블 로그인
2. 메뉴 선택 → 장바구니 → 주문
3. Admin SPA 대시보드에서 주문 확인 (SSE 실시간)
4. 주문 상태 변경 (대기중 → 준비중 → 완료)

### Scenario 3: 테이블 이용 완료
1. Admin SPA에서 테이블 이용 완료 처리
2. Customer SPA 세션 만료 확인
3. Admin SPA 주문 내역에서 기록 확인

### Scenario 4: SSE 실시간 알림
1. Customer SPA에서 주문
2. Admin SPA에서 실시간 주문 수신 확인
3. Admin SPA에서 상태 변경
4. Customer SPA에서 실시간 상태 업데이트 확인

## 검증 방법
- 수동 테스트 (브라우저 2개 탭)
- Network 탭에서 API 호출 확인
- SSE EventSource 연결 확인
