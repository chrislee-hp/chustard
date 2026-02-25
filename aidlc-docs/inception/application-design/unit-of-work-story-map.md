# Unit of Work - Story Map

## Unit 1: API Server

| Story | 관련 API/기능 |
|---|---|
| US-1.1 테이블 자동 로그인 | POST /api/table/login, GET /api/auth/verify |
| US-1.2 메뉴 카테고리 탐색 | GET /api/menus |
| US-1.5 주문 생성 | POST /api/orders |
| US-1.6 주문 내역 조회 | GET /api/orders, SSE order:status-changed |
| US-1.8 세션 만료 안내 | SSE table:completed |
| US-2.1 관리자 로그인 | POST /api/admin/login |
| US-2.2 실시간 주문 모니터링 | GET /api/admin/orders, SSE order:created |
| US-2.3 주문 상세/상태 변경 | PUT /api/admin/orders/:id/status |
| US-2.4 테이블 초기 설정 | POST /api/admin/tables |
| US-2.5 주문 삭제 | DELETE /api/admin/orders/:id |
| US-2.6 테이블 이용 완료 | POST /api/admin/tables/:id/complete |
| US-2.7 과거 주문 내역 | GET /api/admin/orders/history |
| US-2.8 메뉴 관리 | POST/PUT/DELETE /api/admin/menus |
| US-2.9 카테고리 관리 | POST/PUT/DELETE /api/admin/categories |

## Unit 2: Customer SPA

| Story | 관련 화면/기능 |
|---|---|
| US-1.1 테이블 자동 로그인 | 로그인 설정 화면, localStorage 자동 로그인 |
| US-1.2 메뉴 카테고리 탐색 | 메뉴 화면 (카테고리 탭, 카드 레이아웃) |
| US-1.3 장바구니에 메뉴 추가 | 메뉴 카드 탭 → 사이드 패널 추가 |
| US-1.4 장바구니 수량 관리 | 사이드 패널 수량 조절, localStorage |
| US-1.5 주문 생성 | 주문 확인 화면, 성공 페이지 (5초) |
| US-1.6 주문 내역 조회 | 주문 내역 화면, SSE 실시간 상태 |
| US-1.7 언어 전환 | i18n, 언어 전환 버튼 |
| US-1.8 세션 만료 안내 | 세션 만료 안내 화면 |

## Unit 3: Admin SPA

| Story | 관련 화면/기능 |
|---|---|
| US-2.1 관리자 로그인 | 로그인 화면 |
| US-2.2 실시간 주문 모니터링 | 대시보드 (그리드, 테이블 카드, SSE) |
| US-2.3 주문 상세/상태 변경 | 사이드 패널, 순차 상태 버튼 |
| US-2.4 테이블 초기 설정 | 테이블 설정 UI |
| US-2.5 주문 삭제 | 삭제 버튼, 확인 팝업 |
| US-2.6 테이블 이용 완료 | 이용 완료 버튼, 확인 팝업 |
| US-2.7 과거 주문 내역 | 과거 내역 모달, 날짜 필터 |
| US-2.8 메뉴 관리 | 메뉴 CRUD 화면 (다국어 입력) |
| US-2.9 카테고리 관리 | 카테고리 CRUD, 순서 조정 |

## Coverage Summary

| Unit | 스토리 수 | 커버 스토리 |
|---|---|---|
| Unit 1: API Server | 14 (전체) | US-1.1~1.8, US-2.1~2.9 (백엔드 로직) |
| Unit 2: Customer SPA | 8 | US-1.1~1.8 |
| Unit 3: Admin SPA | 9 | US-2.1~2.9 |

모든 17개 스토리가 최소 1개 Unit에 매핑됨. ✅
