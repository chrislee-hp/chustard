# Integration E2E Tests

전체 시스템 통합 E2E 테스트입니다.

## 실행 방법

### 1. 서버 3개를 각각 터미널에서 실행

**터미널 1 - API Server**:
```bash
npm run dev:server
```

**터미널 2 - Customer SPA**:
```bash
npm run dev:customer
```

**터미널 3 - Admin Web**:
```bash
npm run dev:admin
```

### 2. 통합 테스트 실행

**터미널 4**:
```bash
npm run test:e2e -- --project=integration
```

## 테스트 시나리오

### 1. Complete Order Flow
- Customer: 로그인 → 메뉴 선택 → 주문
- Admin: 로그인 → 주문 확인 → 상태 업데이트

### 2. Menu Sync
- Admin: 메뉴 관리 확인
- Customer: 동일한 메뉴 확인

### 3. Real-time SSE Updates
- Admin: 대시보드 대기
- Customer: 새 주문 생성
- Admin: 실시간으로 새 주문 표시 확인

## 주의사항

- 3개 서버가 모두 실행 중이어야 합니다
- 포트: API(3000), Customer(3001), Admin(3002)
- 테스트는 순차적으로 실행됩니다 (workers: 1)
