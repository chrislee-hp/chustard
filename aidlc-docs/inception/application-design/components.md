# Application Design - Components

## 시스템 개요

```
+------------------+     +------------------+     +------------------+
|  Customer SPA    |     |   Admin SPA      |     |                  |
|  (React)         |---->|   (React)        |---->|  API Server      |
|  - 메뉴 조회     |     |  - 주문 모니터링  |     |  (Node.js)       |
|  - 장바구니      |     |  - 메뉴 관리      |     |  - REST API      |
|  - 주문          |     |  - 테이블 관리    |     |  - SSE           |
|  - 주문내역      |     |  - 카테고리 관리  |     |  - Auth (JWT)    |
+------------------+     +------------------+     +--------+---------+
                                                           |
                                                  +--------+---------+
                                                  |    SQLite DB     |
                                                  |  - stores        |
                                                  |  - tables        |
                                                  |  - categories    |
                                                  |  - menus         |
                                                  |  - orders        |
                                                  |  - order_items   |
                                                  |  - order_history |
                                                  |  - admins        |
                                                  +------------------+
```

---

## Component 1: Customer SPA (React)

**Purpose**: 고객이 테이블에서 메뉴를 조회하고 주문하는 웹 애플리케이션

**Responsibilities**:
- 테이블 자동 로그인 및 세션 관리 (localStorage)
- 메뉴 카테고리별 조회 및 표시
- 장바구니 관리 (우측 사이드 패널, localStorage 저장)
- 주문 생성 및 성공/실패 처리
- 주문 내역 조회 (SSE 실시간 상태 업데이트)
- 언어 전환 (한국어/영어, i18n)
- 세션 만료 안내 화면

**Key Pages/Views**:
- 로그인 설정 화면 (초기 1회)
- 메뉴 화면 (기본 화면) + 장바구니 사이드 패널
- 주문 확인 화면
- 주문 성공 화면
- 주문 내역 화면
- 세션 만료 안내 화면

---

## Component 2: Admin SPA (React)

**Purpose**: 관리자가 매장을 운영하고 주문을 관리하는 웹 애플리케이션

**Responsibilities**:
- 관리자 로그인 (JWT 인증)
- 실시간 주문 모니터링 대시보드 (SSE)
- 주문 상세 확인 및 상태 변경 (사이드 패널)
- 테이블 관리 (초기 설정, 주문 삭제, 이용 완료, 과거 내역)
- 메뉴 CRUD (다국어 입력)
- 카테고리 CRUD

**Key Pages/Views**:
- 로그인 화면
- 주문 모니터링 대시보드 (기본 화면) + 테이블 상세 사이드 패널
- 메뉴 관리 화면
- 과거 주문 내역 모달

---

## Component 3: API Server (Node.js)

**Purpose**: 비즈니스 로직 처리, 데이터 관리, 실시간 통신을 담당하는 백엔드 서버

**Responsibilities**:
- REST API 엔드포인트 제공
- SSE 실시간 이벤트 스트리밍 (주문 업데이트)
- 인증/인가 (JWT 발급/검증, bcrypt 해싱)
- 로그인 시도 제한 (5회/5분)
- 테이블 세션 라이프사이클 관리
- 주문 라이프사이클 관리
- 데이터 검증
- Seed data 초기화

**Sub-modules**:
- **Auth Module**: JWT 발급/검증, 로그인 제한, 테이블 인증
- **Menu Module**: 메뉴/카테고리 CRUD, 순서 관리
- **Order Module**: 주문 생성/조회/상태변경/삭제, SSE 이벤트 발행
- **Table Module**: 테이블 설정, 세션 관리, 이용 완료 처리
- **SSE Module**: SSE 연결 관리, 이벤트 브로드캐스트

---

## Component 4: SQLite Database

**Purpose**: 매장, 메뉴, 주문 등 모든 데이터의 영구 저장소

**Tables**:
- `stores` - 매장 정보
- `admins` - 관리자 계정 (bcrypt 해싱 비밀번호)
- `tables` - 테이블 정보 및 세션 관리
- `categories` - 메뉴 카테고리
- `menus` - 메뉴 항목 (한/영 메뉴명, 설명)
- `orders` - 주문 (세션 ID, 상태, 소프트 삭제 플래그)
- `order_items` - 주문 항목 (메뉴, 수량, 단가)
- `order_history` - 과거 주문 이력 (이용 완료 시 이동)
