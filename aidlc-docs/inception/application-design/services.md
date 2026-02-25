# Application Design - Services

## Service Layer Overview

API Server 내부의 서비스 레이어는 Controller → Service → Repository 패턴을 따릅니다.

```
Controller (Route Handler)
    |
    v
Service (Business Logic)
    |
    v
Repository (Data Access)
    |
    v
SQLite Database
```

---

## AuthService

**Responsibility**: 인증/인가 처리

**Orchestration**:
- 관리자 로그인: 자격 증명 검증 → 로그인 시도 제한 확인 → JWT 발급
- 테이블 로그인: 테이블 자격 증명 검증 → 세션 생성/확인 → JWT 발급
- 토큰 검증: JWT 디코딩 → 만료 확인 → 역할(admin/table) 반환

**Dependencies**: AdminRepository, TableRepository

---

## MenuService

**Responsibility**: 메뉴 및 카테고리 관리

**Orchestration**:
- 메뉴 조회: 카테고리별 그룹화 → 순서 정렬 → 반환
- 메뉴 CRUD: 입력 검증 → DB 저장/수정/삭제
- 카테고리 CRUD: 입력 검증 → DB 저장/수정/삭제
- 순서 변경: 순서 값 업데이트

**Dependencies**: MenuRepository, CategoryRepository

---

## OrderService

**Responsibility**: 주문 라이프사이클 관리

**Orchestration**:
- 주문 생성: 세션 유효성 확인 → 메뉴 존재 확인 → 주문 저장 → SSE 이벤트 발행
- 상태 변경: 상태 전이 검증 (대기중→준비중→완료) → 업데이트 → SSE 이벤트 발행
- 주문 삭제: 소프트 삭제 플래그 → 총 주문액 재계산 → SSE 이벤트 발행
- 주문 조회: 세션별 필터링 → 삭제된 주문 제외 → 반환
- 과거 내역: 이력 테이블 조회 → 날짜 필터링 → 반환

**Dependencies**: OrderRepository, TableService, SSEService

---

## TableService

**Responsibility**: 테이블 및 세션 관리

**Orchestration**:
- 테이블 설정: 테이블 번호/비밀번호 저장
- 이용 완료: 현재 세션 주문 → 이력 테이블로 이동 → 세션 리셋 → SSE 이벤트 발행 (table:completed)
- 세션 관리: 첫 주문 시 세션 시작, 이용 완료 시 세션 종료

**Dependencies**: TableRepository, OrderRepository, SSEService

---

## SSEService

**Responsibility**: 실시간 이벤트 스트리밍

**Orchestration**:
- 연결 관리: 클라이언트 연결 등록/해제
- 이벤트 발행: 주문 생성/상태변경/삭제/세션종료 이벤트를 관련 클라이언트에 브로드캐스트
- 대상 필터링: admin은 매장 전체, customer는 해당 테이블만

**Dependencies**: 없음 (다른 서비스에서 호출됨)
