# Unit of Work - Dependency Matrix

## Unit Dependencies

| From | To | Type | Description |
|---|---|---|---|
| Unit 2 (Customer SPA) | API Contract | HTTP + SSE | 개발 시 Mock API 사용, 통합 시 실제 API 연결 |
| Unit 3 (Admin SPA) | API Contract | HTTP + SSE | 개발 시 Mock API 사용, 통합 시 실제 API 연결 |
| Unit 1 (API Server) | API Contract | Implementation | API Contract의 실제 구현 |

## 병렬 개발 전략

**핵심**: API Contract(component-methods.md)가 3개 Unit의 공통 계약 역할
- Unit 1: Contract 기반으로 실제 서버 구현
- Unit 2/3: Contract 기반 Mock API(MSW 등)로 독립 개발
- 통합 시 Mock → 실제 API로 전환

## Development Order

```
[API Contract 정의] (선행 - Units 공통)
        |
        +---> Unit 1: API Server ──────────>
        +---> Unit 2: Customer SPA ────────>
        +---> Unit 3: Admin SPA ───────────>
              (3개 Unit 완전 병렬 개발)
                          |
                          v
              [Integration Testing]
```

**Phase 0 (선행)**: API Contract 정의 - OpenAPI 스펙 또는 API 계약 문서를 먼저 확정 (component-methods.md 기반)
**Phase 1 (병렬)**: 3개 Unit 동시 개발
- Unit 1: API Contract 기반으로 실제 서버 구현
- Unit 2: Mock API 기반으로 고객 UI 개발
- Unit 3: Mock API 기반으로 관리자 UI 개발
**Phase 2**: Integration Testing - 실제 API 연결 후 통합 테스트

## Integration Points

| Integration | Contract | Notes |
|---|---|---|
| Customer ↔ API | REST API + SSE | 테이블 토큰 인증 |
| Admin ↔ API | REST API + SSE | JWT 관리자 토큰 인증 |
| Customer ← SSE | order:status-changed, table:completed | 주문 상태, 세션 종료 |
| Admin ← SSE | order:created, order:status-changed, order:deleted, table:completed | 전체 주문 이벤트 |
