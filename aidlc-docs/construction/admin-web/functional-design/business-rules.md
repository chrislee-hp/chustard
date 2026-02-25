# Business Rules - admin-web

## Overview
Admin SPA의 비즈니스 규칙, 검증 로직, UI 제약사항

---

## 1. Authentication Rules

### AR-1: Login Validation
- **Rule**: 모든 필드(매장 식별자, 사용자명, 비밀번호) 필수
- **Validation Point**: Submit 시점
- **Error Handling**: Alert dialog로 에러 메시지 표시

### AR-2: Login Failure Limit
- **Rule**: 5회 로그인 실패 시 5분간 차단
- **Implementation**: 서버에서 처리, 클라이언트는 에러 메시지만 표시
- **Error Message**: "로그인 시도 횟수 초과. 5분 후 다시 시도해주세요."

### AR-3: Session Duration
- **Rule**: 로그인 후 16시간 동안 세션 유지
- **Implementation**: localStorage에 token_expiry 저장, 매 요청 시 검증
- **Expiry Handling**: 세션 만료 시 안내 후 로그인 페이지로 리다이렉트

### AR-4: Session Persistence
- **Rule**: 브라우저 재시작 시에도 세션 유지 (16시간 이내)
- **Implementation**: localStorage 사용
- **Validation**: 앱 시작 시 token_expiry 체크

---

## 2. Dashboard Rules

### DR-1: Table Card Display
- **Rule**: 활성/비활성 테이블 시각적으로 구분
- **Active**: 현재 세션이 있는 테이블
- **Inactive**: 세션이 없는 테이블
- **Visual**: 색상, 투명도로 구분

### DR-2: Order Preview
- **Rule**: 테이블 카드에 전체 주문 표시 (스크롤)
- **Display**: 주문 번호, 상태, 금액
- **Sorting**: 시간 순 (최신 순)

### DR-3: New Order Notification
- **Rule**: 신규 주문 시 시각적 강조 + 소리 알림
- **Visual**: 애니메이션, 색상 변경
- **Audio**: 800Hz, 200ms 비프음
- **Duration**: 5초 후 자동으로 강조 해제

### DR-4: Data Refresh
- **Rule**: SSE 실시간 업데이트 + 5분마다 polling
- **SSE**: 주문 생성/수정/삭제 이벤트
- **Polling**: 전체 테이블 데이터 갱신 (SSE 누락 방지)

### DR-5: Table Filtering
- **Rule**: 특정 테이블만 필터링 가능
- **Implementation**: 드롭다운 선택
- **Default**: 전체 테이블 표시

---

## 3. Order Management Rules

### OR-1: Order Status Transition
- **Rule**: 상태는 순차적으로만 변경 가능
- **Flow**: pending → preparing → completed
- **Validation**: 서버에서 처리, 클라이언트는 다음 상태만 표시

### OR-2: Status Change Confirmation
- **Rule**: 완료 처리 시에만 확인 팝업
- **pending → preparing**: 즉시 변경
- **preparing → completed**: 확인 팝업 ("주문을 완료 처리하시겠습니까?")
- **completed**: 더 이상 변경 불가

### OR-3: Order Deletion
- **Rule**: 2단계 확인 필수
- **Step 1**: "삭제하시겠습니까?" (확인/취소)
- **Step 2**: "정말 삭제하시겠습니까?" (확인/취소)
- **Implementation**: 소프트 삭제 (deletedAt 필드)
- **Effect**: 테이블 총 주문액 재계산

### OR-4: Deleted Order Display
- **Rule**: 삭제된 주문은 과거 내역에서 "삭제됨"으로 표시
- **Current Orders**: 삭제된 주문 제외
- **Historical Orders**: 삭제된 주문 포함, 상태 표시

---

## 4. Table Session Rules

### TR-1: Session Completion
- **Rule**: 테이블 이용 완료 시 확인 팝업
- **Confirmation**: "이용 완료 처리하시겠습니까?" (확인/취소)
- **Additional Input**: 없음 (확인만)
- **Effect**: 
  - 현재 세션의 주문 → 과거 이력으로 이동
  - 테이블 주문 목록 및 총 주문액 리셋
  - 고객 화면에 "이용이 종료되었습니다" 안내 표시

### TR-2: Table Initialization
- **Rule**: 관리자 화면에서 테이블 번호와 비밀번호 설정
- **Implementation**: 서버 API 호출
- **Effect**: 고객 태블릿에서 자동 로그인 활성화

---

## 5. Order History Rules

### HR-1: History Display Range
- **Rule**: 전체 과거 주문 표시 (페이지네이션 없음)
- **Loading Strategy**: Infinite scroll
- **Sorting**: 시간 역순 (최신 순)

### HR-2: History Data
- **Display**: 주문 번호, 시각, 메뉴 목록, 총 금액, 이용 완료 시각
- **Deleted Orders**: "삭제됨" 표시 포함
- **Filter**: 날짜 필터 없음 (전체 표시)

---

## 6. Menu Management Rules

### MR-1: Menu Form Validation
- **Required Fields**: 메뉴명(한), 메뉴명(영), 카테고리
- **Optional Fields**: 설명(한/영), 이미지 URL
- **Price Validation**: 0보다 큰 숫자
- **URL Validation**: http:// 또는 https:// 시작
- **Validation Point**: Submit 시점
- **Error Display**: Alert dialog

### MR-2: Menu Display Order
- **Rule**: Up/Down 버튼으로 순서 조정
- **Implementation**: displayOrder 필드 swap
- **Constraint**: 
  - 최상단 메뉴는 Up 불가
  - 최하단 메뉴는 Down 불가

### MR-3: Menu Deletion
- **Rule**: 단순 확인 팝업 ("메뉴를 삭제하시겠습니까?")
- **Effect**: 메뉴 목록에서 즉시 제거
- **Cascade**: 고객 화면에서는 새로고침 시 반영

### MR-4: Menu Update Propagation
- **Rule**: 메뉴 변경 시 고객 화면은 새로고침해야 반영
- **No SSE**: 메뉴 변경은 실시간 푸시 없음
- **Reason**: 고객이 주문 중일 때 메뉴가 갑자기 바뀌면 혼란

---

## 7. Category Management Rules

### CR-1: Category Form Validation
- **Required Fields**: 카테고리명(한), 카테고리명(영)
- **Validation Point**: Submit 시점
- **Error Display**: Alert dialog

### CR-2: Category Deletion
- **Rule**: 해당 카테고리에 메뉴가 있으면 삭제 불가
- **Validation**: 서버에서 처리
- **Error Message**: "해당 카테고리에 메뉴가 있습니다. 먼저 메뉴를 삭제하거나 다른 카테고리로 이동해주세요."

---

## 8. API Integration Rules

### AI-1: API Retry
- **Rule**: 실패 시 사용자에게 재시도 버튼 제공
- **No Auto-retry**: 자동 재시도 없음
- **Confirmation**: "요청 실패. 다시 시도하시겠습니까?"

### AI-2: Loading Indicator
- **Rule**: 컴포넌트별 로딩 상태 표시
- **Implementation**: 버튼 내 스피너
- **No Global Spinner**: 전역 로딩 스피너 없음

### AI-3: Error Handling
- **Network Error**: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요."
- **401 Unauthorized**: 세션 만료 안내 후 로그인 페이지 리다이렉트
- **403 Forbidden**: "권한이 없습니다." (에러 메시지만 표시)
- **404 Not Found**: "요청한 리소스를 찾을 수 없습니다."
- **500 Server Error**: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
- **Display**: Alert dialog

---

## 9. SSE Connection Rules

### SR-1: SSE Reconnection
- **Rule**: 연결 끊김 시 Exponential backoff으로 재연결
- **Initial Delay**: 1초
- **Max Delay**: 30초
- **Formula**: delay = min(1000 * 2^attempts, 30000)
- **No User Notification**: 자동 재연결, 사용자 알림 없음

### SR-2: SSE Connection Status
- **States**: connecting, connected, disconnected, error
- **Display**: 상태 표시 없음 (백그라운드 처리)
- **Fallback**: Polling으로 데이터 보완

---

## 10. UI/UX Rules

### UR-1: Tab Navigation
- **Rule**: Single-page with tab navigation
- **Tabs**: 주문 모니터링, 메뉴 관리
- **Active Tab**: URL 기반 (/admin/orders, /admin/menus)
- **Persistence**: 새로고침 시 현재 탭 유지

### UR-2: Side Panel
- **Rule**: Slide-in overlay 방식
- **Trigger**: 테이블 카드 클릭
- **Close**: 
  - 닫기 버튼 클릭
  - 오버레이 영역 클릭
- **Animation**: 우측에서 슬라이드 인

### UR-3: Menu Form Page
- **Rule**: 메뉴 등록/수정 시 별도 페이지로 이동
- **Routes**: 
  - /admin/menus/create
  - /admin/menus/:id/edit
- **Navigation**: 
  - 저장 → 메뉴 목록으로 복귀
  - 취소 → 메뉴 목록으로 복귀

### UR-4: Dark Mode
- **Rule**: 다크 모드 지원 없음
- **Reason**: 관리자 화면은 밝은 환경에서 사용

---

## 11. Performance Rules

### PR-1: Table Card Rendering
- **Rule**: 최적화 불필요 (테이블 수 적음)
- **Assumption**: 일반 음식점 10~50개 테이블
- **No Virtualization**: 전체 렌더링
- **No Pagination**: 전체 표시

### PR-2: Order History Loading
- **Rule**: Infinite scroll
- **Page Size**: 20개씩 로드
- **Trigger**: 스크롤이 하단 100px 이내 도달 시
- **Loading Indicator**: 하단에 "로딩 중..." 표시

---

## 12. TypeScript Rules

### TS-1: Strict Mode
- **Rule**: strict: true
- **Enforcement**: 
  - strictNullChecks
  - noImplicitAny
  - strictFunctionTypes
  - strictPropertyInitialization

### TS-2: API Type Generation
- **Rule**: OpenAPI/Swagger 기반 자동 생성
- **Tool**: openapi-typescript 또는 swagger-typescript-api
- **Location**: src/types/api.ts
- **Update**: API 스키마 변경 시 재생성

---

## Summary

**Total Rules**: 40+ business rules across 12 categories

**Key Constraints**:
- 2-step confirmation for critical actions (order deletion)
- Session persistence with 16-hour expiry
- SSE + polling hybrid data refresh
- Component-level loading states
- Alert dialog for all errors
- No auto-retry for API failures
- Infinite scroll for order history
- No dark mode support
- TypeScript strict mode enforced
