# Functional Design Plan - admin-web

## Unit Context
**Unit**: admin-web (Unit 3)
**Type**: React SPA
**Priority**: 1 (병렬 개발)

**Assigned Stories**:
- US-2.1: 관리자 로그인
- US-2.2: 실시간 주문 모니터링
- US-2.3: 주문 상세 확인 및 상태 변경
- US-2.4: 테이블 초기 설정
- US-2.5: 주문 삭제
- US-2.6: 테이블 이용 완료 처리
- US-2.7: 과거 주문 내역 조회
- US-2.8: 메뉴 관리
- US-2.9: 카테고리 관리

---

## Execution Plan

### Phase 1: Context Analysis
- [x] Review unit definition and scope
- [x] Review assigned user stories
- [x] Identify frontend components and state management needs
- [x] Identify API integration points

### Phase 2: Question Generation
- [x] Generate questions about UI component structure
- [x] Generate questions about state management approach
- [x] Generate questions about form validation rules
- [x] Generate questions about user interaction flows
- [x] Generate questions about API integration patterns
- [x] Generate questions about error handling and edge cases

### Phase 3: Answer Collection
- [x] Present questions to user with [Answer]: tags
- [x] Wait for user responses
- [x] Analyze responses for ambiguities
- [x] Generate follow-up questions if needed
- [x] Confirm all ambiguities resolved

### Phase 4: Artifact Generation
- [x] Create frontend-components.md (component hierarchy, props, state)
- [x] Create business-logic-model.md (client-side logic, data transformations)
- [x] Create business-rules.md (validation rules, UI constraints)
- [x] Create domain-entities.md (frontend data models, TypeScript interfaces)

### Phase 5: Review and Approval
- [x] Present completion message
- [x] Wait for user approval
- [x] Address any requested changes
- [x] Update aidlc-state.md and audit.md

---

## Questions for User

### 1. UI Component Architecture

**Q1.1**: Admin 화면의 전체 레이아웃 구조는 어떻게 구성하시겠습니까?

A) Single-page with tab navigation (주문 모니터링 / 메뉴 관리 탭 전환)
B) Multi-page with routing (각 기능별 별도 route)
C) Hybrid (주요 기능은 탭, 상세 화면은 route)

[Answer]: A
A) 메뉴 등록/수정 시에만 별도 페이지 (메뉴 목록은 탭 내)

**Q1.2**: 주문 모니터링 대시보드의 테이블 카드 레이아웃은?

A) Grid layout (고정 열 수, 반응형)
B) Masonry layout (가변 높이, Pinterest 스타일)
C) List layout (세로 목록)

[Answer]: A

**Q1.3**: 주문 상세 사이드 패널의 동작 방식은?

A) Slide-in overlay (화면 위에 오버레이)
B) Split view (화면을 좌우로 분할)
C) Modal dialog (중앙 팝업)

[Answer]: A

**Q1.4**: 메뉴 관리 화면의 CRUD 인터페이스는?

A) Inline editing (테이블 내에서 직접 수정)
B) Modal form (팝업 폼으로 수정)
C) Dedicated page (별도 페이지로 이동)

[Answer]: C

---

### 2. State Management

**Q2.1**: 전역 상태 관리 라이브러리를 사용하시겠습니까?

A) React Context API only (내장 기능만 사용)
B) Redux Toolkit (복잡한 상태 관리)
C) Zustand (경량 상태 관리)
D) Jotai/Recoil (Atomic 상태 관리)

[Answer]: B

**Q2.2**: SSE 실시간 데이터는 어떻게 관리하시겠습니까?

A) Global state에 저장 (모든 컴포넌트에서 접근)
B) Custom hook으로 캡슐화 (useSSE)
C) Context Provider로 제공

[Answer]: B

**Q2.3**: 로그인 세션 정보는 어디에 저장하시겠습니까?

A) localStorage (브라우저 재시작 시에도 유지)
B) sessionStorage (탭 닫으면 삭제)
C) Memory only (새로고침 시 재로그인)

[Answer]: A

---

### 3. Form Validation

**Q3.1**: 로그인 폼의 클라이언트 검증 규칙은?

A) 필수 필드만 검증 (빈 값 체크)
B) 형식 검증 포함 (매장 식별자 패턴, 비밀번호 길이)
C) 실시간 검증 (입력 중 즉시 피드백)

[Answer]: A

**Q3.2**: 메뉴 등록/수정 폼의 검증 시점은?

A) Submit 시점에만 검증
B) Blur 시점에 검증 (필드 벗어날 때)
C) Change 시점에 실시간 검증

[Answer]: A

**Q3.3**: 메뉴 이미지 URL 검증은?

A) URL 형식만 검증 (http/https)
B) 이미지 로드 가능 여부까지 검증
C) 검증 없음 (서버에서만 검증)

[Answer]: A

---

### 4. User Interaction Flows

**Q4.1**: 주문 상태 변경 시 확인 팝업이 필요합니까?

A) 필요 없음 (클릭 즉시 변경)
B) 특정 상태만 확인 (예: 완료 처리 시)
C) 모든 상태 변경 시 확인

[Answer]: B

**Q4.2**: 주문 삭제 시 확인 절차는?

A) 단순 확인 팝업 (확인/취소)
B) 삭제 사유 입력 필수
C) 2단계 확인 (확인 → 재확인)

[Answer]: C
1단계: "삭제하시겠습니까?" → 2단계: "정말 삭제하시겠습니까?"

**Q4.3**: 테이블 이용 완료 처리 시 추가 정보 입력이 필요합니까?

A) 필요 없음 (확인만)
B) 결제 금액 입력
C) 완료 메모 입력 (선택)

[Answer]: A

**Q4.4**: 과거 주문 내역 조회 시 기본 표시 범위는?

A) 오늘 날짜만
B) 최근 7일
C) 최근 30일
D) 전체 (페이지네이션)

[Answer]: D

---

### 5. API Integration

**Q5.1**: API 호출 실패 시 재시도 로직이 필요합니까?

A) 필요 없음 (에러 메시지만 표시)
B) 자동 재시도 (최대 3회)
C) 사용자 선택 (재시도 버튼 제공)

[Answer]: C

**Q5.2**: SSE 연결 끊김 시 재연결 전략은?

A) 즉시 재연결 시도
B) Exponential backoff (점진적 재시도 간격 증가)
C) 사용자에게 알림 후 수동 재연결

[Answer]: B

**Q5.3**: API 응답 대기 중 로딩 인디케이터는?

A) 전역 로딩 스피너 (화면 전체)
B) 컴포넌트별 로딩 상태 (버튼 내 스피너)
C) Progress bar (상단 고정)

[Answer]: B

---

### 6. Error Handling

**Q6.1**: 네트워크 에러 발생 시 사용자 피드백은?

A) Toast notification (자동 사라짐)
B) Alert dialog (확인 필요)
C) Inline error message (폼 내부)

[Answer]: B

**Q6.2**: 세션 만료 시 동작은?

A) 로그인 페이지로 자동 리다이렉트
B) 세션 만료 안내 후 로그인 페이지 이동
C) 현재 페이지에서 로그인 모달 표시

[Answer]: B

**Q6.3**: 권한 없는 작업 시도 시 처리는?

A) 에러 메시지만 표시
B) 로그인 페이지로 리다이렉트
C) 403 에러 페이지 표시

[Answer]: A

---

### 7. UI/UX Details

**Q7.1**: 신규 주문 알림 방식은?

A) 시각적 강조만 (색상 변경, 애니메이션)
B) 브라우저 알림 (Notification API)
C) 소리 알림 포함

[Answer]: C

**Q7.2**: 테이블 카드의 주문 미리보기는 몇 개까지 표시합니까?

A) 최신 3개
B) 최신 5개
C) 최신 10개
D) 전체 (스크롤)

[Answer]: D

**Q7.3**: 메뉴 노출 순서 조정 방식은?

A) Drag & drop
B) Up/Down 버튼
C) 숫자 입력

[Answer]: B

**Q7.4**: 다크 모드 지원이 필요합니까?

A) 필요 (시스템 설정 따름)
B) 필요 (수동 토글)
C) 불필요

[Answer]: C

---

### 8. Data Refresh Strategy

**Q8.1**: 대시보드 데이터 갱신 전략은?

A) SSE만 사용 (실시간 푸시)
B) SSE + 주기적 polling (5분마다)
C) SSE + 사용자 수동 새로고침

[Answer]: B

**Q8.2**: 메뉴 목록 변경 시 고객 화면 반영은?

A) 고객이 새로고침해야 반영
B) SSE로 자동 반영
C) 주기적 polling으로 반영

[Answer]: A

---

### 9. Performance Optimization

**Q9.1**: 테이블 카드 목록 렌더링 최적화는?

A) 가상화 (react-window/react-virtualized)
B) 페이지네이션
C) 최적화 불필요 (테이블 수 적음)

[Answer]: C

**Q9.2**: 과거 주문 내역 로딩 전략은?

A) 전체 로드 후 클라이언트 필터링
B) 서버 페이지네이션
C) Infinite scroll

[Answer]: C

---

### 10. TypeScript Strictness

**Q10.1**: TypeScript strict mode를 사용하시겠습니까?

A) Yes (strict: true)
B) No (일부 규칙만 활성화)

[Answer]: A

**Q10.2**: API 응답 타입 정의는?

A) 수동 작성 (interfaces/types)
B) OpenAPI/Swagger 기반 자동 생성
C) 타입 정의 없음 (any 사용)

[Answer]: B

---

## Next Steps

사용자가 모든 [Answer]: 태그를 채운 후:
1. 답변 분석 및 모호한 부분 확인
2. 필요 시 추가 질문 생성
3. Functional Design 아티팩트 생성
4. 사용자 승인 대기
