# Application Design - Component Dependencies

## Dependency Matrix

| From | To | Type | Description |
|---|---|---|---|
| Customer SPA | API Server | HTTP/SSE | REST API 호출 + SSE 구독 |
| Admin SPA | API Server | HTTP/SSE | REST API 호출 + SSE 구독 |
| API Server | SQLite DB | SQL | 데이터 읽기/쓰기 |
| OrderService | SSEService | Internal | 주문 이벤트 발행 |
| OrderService | TableService | Internal | 세션 유효성 확인 |
| TableService | SSEService | Internal | 세션 종료 이벤트 발행 |
| TableService | OrderRepository | Internal | 주문 이력 이동 |
| AuthService | AdminRepository | Internal | 관리자 자격 증명 조회 |
| AuthService | TableRepository | Internal | 테이블 자격 증명 조회 |

## Communication Patterns

```
Customer SPA ----HTTP----> API Server
Customer SPA <---SSE----- API Server (주문 상태, 세션 종료)

Admin SPA ------HTTP----> API Server
Admin SPA <-----SSE----- API Server (신규 주문, 상태 변경, 삭제)

API Server -----SQL-----> SQLite DB
```

## Data Flow: 주문 생성

```
Customer SPA                API Server                    Admin SPA
     |                          |                             |
     |-- POST /api/orders ----->|                             |
     |                          |-- OrderService.create() --->|
     |                          |-- DB insert               |
     |                          |-- SSEService.broadcast() -->|
     |<-- 201 { order } -------|                             |
     |                          |--- SSE: order:created ----->|
```

## Data Flow: 테이블 이용 완료

```
Admin SPA                  API Server                   Customer SPA
     |                          |                             |
     |-- POST /tables/:id/     |                             |
     |   complete ------------->|                             |
     |                          |-- 주문 → order_history     |
     |                          |-- 세션 리셋                |
     |                          |-- SSE: table:completed ---->|
     |<-- 200 { success } -----|                             |
     |                          |                    세션 만료 안내 표시
```
