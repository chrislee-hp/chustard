# Unit 1 API Server - E2E 테스트 결과

## 테스트 환경
- Node.js 24.x
- sql.js (better-sqlite3 대체)
- Express 4.x

## 테스트 일시
2026-02-25

## User Stories 기반 테스트 결과

### Journey 1: 고객 주문 여정

| Story ID | 기능 | 결과 | 비고 |
|----------|------|------|------|
| US-1.1 | 테이블 로그인 | ✅ Pass | JWT 토큰 및 세션 ID 발급 |
| US-1.2 | 메뉴 카테고리 탐색 | ✅ Pass | 카테고리별 메뉴 조회 |
| US-1.5 | 주문 생성 | ✅ Pass | 주문번호 발급, 금액 계산 |
| US-1.5 | 추가 주문 | ✅ Pass | 새 주문번호 발급 |
| US-1.6 | 주문 내역 조회 | ✅ Pass | 세션별 주문 목록 |

### Journey 2: 관리자 운영 여정

| Story ID | 기능 | 결과 | 비고 |
|----------|------|------|------|
| US-2.1 | 관리자 로그인 | ✅ Pass | JWT 토큰 발급 |
| US-2.1 | 계정 잠금 (5회 실패) | ✅ Pass | LOGIN_LOCKED 응답 |
| US-2.3 | 주문 상태 변경 | ✅ Pass | pending→preparing→completed |
| US-2.4 | 테이블 생성 | ✅ Pass | 테이블 번호, 비밀번호 설정 |
| US-2.5 | 주문 삭제 | ✅ Pass | 소프트 삭제 |
| US-2.6 | 테이블 이용 완료 | ✅ Pass | 세션 종료 |
| US-2.8 | 메뉴 생성 | ✅ Pass | 한/영 이름, 가격, 카테고리 |
| US-2.9 | 카테고리 생성 | ✅ Pass | 카테고리명 |

### 보안 테스트

| 테스트 항목 | 결과 | 비고 |
|-------------|------|------|
| 잘못된 비밀번호 거부 | ✅ Pass | UNAUTHORIZED |
| 인증 없이 API 접근 거부 | ✅ Pass | UNAUTHORIZED |
| 잘못된 토큰 거부 | ✅ Pass | UNAUTHORIZED |

## 테스트 요약

- **총 테스트**: 16개
- **성공**: 16개
- **실패**: 0개
- **성공률**: 100%

## 주요 수정 사항 (sql.js 마이그레이션)

### 문제점
Node.js 24에서 better-sqlite3 네이티브 모듈 빌드 실패

### 해결책
sql.js (WebAssembly 기반 SQLite) 사용

### 변경 내용
1. `database.js`: sql.js 초기화 및 헬퍼 함수
   - `PRAGMA foreign_keys = ON` 활성화
   - `createStatement()` 래퍼로 better-sqlite3 호환 인터페이스 제공
   - `saveDb()` 호출 전 `last_insert_rowid()` 가져오기 (순서 중요)

2. `init.js`: 비동기 초기화 지원

3. 모든 Repository: sql.js API 호환

## API 엔드포인트 검증

### 인증
- `POST /api/admin/login` - 관리자 로그인
- `POST /api/table/login` - 테이블 로그인

### 메뉴
- `GET /api/menus?storeId=` - 메뉴 조회
- `POST /api/admin/menus` - 메뉴 생성

### 주문
- `POST /api/orders` - 주문 생성
- `GET /api/orders?tableId=&sessionId=` - 주문 조회
- `PUT /api/admin/orders/:id/status` - 상태 변경
- `DELETE /api/admin/orders/:id` - 주문 삭제

### 테이블
- `POST /api/admin/tables` - 테이블 생성
- `POST /api/admin/tables/:id/complete` - 이용 완료

### 카테고리
- `POST /api/admin/categories` - 카테고리 생성
