# 통합 E2E 테스트 실행 가이드

## 🚀 실행 방법

### 1단계: 터미널 4개 준비

**터미널 1 - API Server 실행**
```bash
cd /Users/janon/Developer/aidlc-workshop
npm run dev:server
```
✅ "Server running on port 3000" 메시지 확인

---

**터미널 2 - Customer SPA 실행**
```bash
cd /Users/janon/Developer/aidlc-workshop
npm run dev:customer
```
✅ "Local: http://localhost:3001" 메시지 확인

---

**터미널 3 - Admin Web 실행**
```bash
cd /Users/janon/Developer/aidlc-workshop
npm run dev:admin
```
✅ "Local: http://localhost:3002" 메시지 확인

---

**터미널 4 - 통합 테스트 실행**
```bash
cd /Users/janon/Developer/aidlc-workshop
npm run test:e2e -- --project=integration
```

---

## 📋 테스트 시나리오

### Test 1: Complete Order Flow
- Customer 로그인 (Table 1)
- 메뉴 2개 담기
- 주문하기
- Admin 로그인
- Table 1 주문 확인
- 주문 상태 변경 (preparing)

### Test 2: Menu Sync
- Admin 로그인
- 메뉴 관리 탭 이동
- 메뉴 목록 확인 (김치찌개)
- Customer 로그인 (Table 2)
- 동일한 메뉴 확인

### Test 3: Real-time SSE Updates
- Admin 로그인 및 대시보드 대기
- Customer 로그인 (Table 5)
- 주문 생성
- Admin에서 실시간으로 Table 5 표시 확인

---

## ⚠️ 문제 해결

### 포트 충돌
```bash
# 기존 프로세스 종료
lsof -ti:3000,3001,3002 | xargs kill -9
```

### 서버 시작 실패
```bash
# 의존성 재설치
npm install
cd server && npm install
cd ../client/customer && npm install
cd ../admin && npm install
```

### 데이터베이스 초기화
```bash
cd server
npm run db:init
```

---

## 🎯 예상 결과

```
Running 3 tests using 1 worker

  ✓  [integration] › full-system.spec.ts:4:7 › should handle complete order flow
  ✓  [integration] › full-system.spec.ts:X:7 › should sync menu changes
  ✓  [integration] › full-system.spec.ts:Y:7 › should handle real-time SSE updates

  3 passed (XXs)
```
