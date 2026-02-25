# Unit of Work Definitions

## 분해 전략

Monorepo 구조에서 3개 Unit으로 분해합니다. 각 Unit은 독립적으로 개발 가능하며, Unit 간 의존성은 API 계약(REST/SSE)으로 연결됩니다.

---

## Unit 1: API Server (Backend)

**Type**: Node.js 서버 (Express/Fastify)
**Priority**: 1 (병렬 - API Contract 기반 구현)

**Scope**:
- REST API 전체 엔드포인트
- SSE 실시간 이벤트 스트리밍
- JWT 인증/인가 (관리자 + 테이블)
- 비즈니스 로직 (AuthService, MenuService, OrderService, TableService, SSEService)
- SQLite DB 스키마 및 Repository 레이어
- Seed data (관리자 계정, 샘플 메뉴/카테고리)
- 입력 검증, 에러 처리

**Directory**: `server/`

---

## Unit 2: Customer SPA (Frontend - 고객)

**Type**: React SPA
**Priority**: 1 (병렬 - Mock API 기반 독립 개발)

**Scope**:
- 테이블 자동 로그인 (localStorage)
- 메뉴 카테고리별 조회 화면
- 장바구니 사이드 패널 (localStorage 저장)
- 주문 생성 및 성공/실패 화면
- 주문 내역 조회 (SSE 실시간 상태)
- 언어 전환 (i18n: 한국어/영어)
- 세션 만료 안내 화면

**Directory**: `client/customer/`

---

## Unit 3: Admin SPA (Frontend - 관리자)

**Type**: React SPA
**Priority**: 1 (병렬 - Mock API 기반 독립 개발)

**Scope**:
- 관리자 로그인 (JWT)
- 주문 모니터링 대시보드 (SSE, 그리드 레이아웃)
- 주문 상세 사이드 패널 및 상태 변경
- 테이블 관리 (초기 설정, 주문 삭제, 이용 완료)
- 과거 주문 내역 조회
- 메뉴 CRUD (다국어 입력)
- 카테고리 CRUD

**Directory**: `client/admin/`

---

## Code Organization (Greenfield)

```
table-order/
+-- server/                    # Unit 1: API Server
|   +-- src/
|   |   +-- routes/            # Route handlers
|   |   +-- services/          # Business logic
|   |   +-- repositories/      # Data access
|   |   +-- middleware/         # Auth, validation
|   |   +-- sse/               # SSE management
|   |   +-- db/                # SQLite schema, migrations, seed
|   |   +-- utils/             # Helpers
|   |   +-- app.js             # App setup
|   |   +-- index.js           # Entry point
|   +-- package.json
|
+-- client/
|   +-- customer/              # Unit 2: Customer SPA
|   |   +-- src/
|   |   |   +-- components/
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- i18n/          # Translations
|   |   |   +-- utils/
|   |   |   +-- App.jsx
|   |   +-- package.json
|   |
|   +-- admin/                 # Unit 3: Admin SPA
|       +-- src/
|       |   +-- components/
|       |   +-- pages/
|       |   +-- hooks/
|       |   +-- utils/
|       |   +-- App.jsx
|       +-- package.json
|
+-- package.json               # Root (workspaces)
```
