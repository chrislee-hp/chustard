# Unit 2: Customer SPA - Functional Design Plan

## Unit Context
- **Unit Name**: Customer SPA (Frontend - 고객)
- **Type**: React SPA
- **Priority**: 1 (병렬)
- **Directory**: `client/customer/`

## Assigned Stories
- US-1.1 테이블 자동 로그인
- US-1.2 메뉴 카테고리 탐색
- US-1.3 장바구니에 메뉴 추가
- US-1.4 장바구니 수량 관리
- US-1.5 주문 생성
- US-1.6 주문 내역 조회
- US-1.7 언어 전환
- US-1.8 세션 만료 안내

---

## Clarification Questions

### Q1: React 라우팅 방식
React Router 사용 방식을 선택해 주세요.

A) Hash Router (/#/menu, /#/orders) - 정적 호스팅 호환
B) Browser Router (/menu, /orders) - 서버 설정 필요

[Answer]:

---

### Q2: 상태 관리 라이브러리
전역 상태 관리 방식을 선택해 주세요.

A) React Context + useReducer (의존성 최소화)
B) Zustand (경량 상태 관리)
C) Redux Toolkit (대규모 앱 표준)

[Answer]:

---

### Q3: CSS 스타일링 방식
스타일링 방식을 선택해 주세요.

A) CSS Modules (컴포넌트별 스코프)
B) Tailwind CSS (유틸리티 클래스)
C) Styled-components (CSS-in-JS)

[Answer]:

---

### Q4: 빌드 도구
빌드 도구를 선택해 주세요.

A) Vite (빠른 개발 서버, ESM 기반)
B) Create React App (표준 설정)

[Answer]:

---

### Q5: API 호출 라이브러리
HTTP 클라이언트를 선택해 주세요.

A) fetch API (내장, 의존성 없음)
B) Axios (인터셉터, 에러 처리 편의)

[Answer]:

---

### Q6: 장바구니 저장 위치
장바구니 데이터 저장 위치를 선택해 주세요.

A) localStorage (브라우저 종료 후에도 유지)
B) sessionStorage (탭 종료 시 삭제)

[Answer]:

---

## Execution Plan

### Step 1: Component Structure 정의
- [ ] 페이지 컴포넌트 식별 (Menu, Orders, Success, SessionExpired)
- [ ] 공통 컴포넌트 식별 (Header, CartPanel, MenuCard, OrderCard)
- [ ] 컴포넌트 계층 구조 정의

### Step 2: State Management 설계
- [ ] 전역 상태 정의 (auth, cart, language)
- [ ] 로컬 상태 정의 (각 페이지별)
- [ ] 상태 변경 액션 정의

### Step 3: Data Flow 설계
- [ ] API 호출 흐름 (로그인, 메뉴 조회, 주문 생성/조회)
- [ ] SSE 연결 및 이벤트 처리 흐름
- [ ] 에러 처리 흐름

### Step 4: i18n 설계
- [ ] 번역 키 구조 정의
- [ ] 언어 전환 로직

### Step 5: UI/UX Flow 정의
- [ ] 화면 전환 흐름
- [ ] 사용자 인터랙션 흐름

---

## Artifacts to Generate

1. **component-structure.md**: 컴포넌트 계층, 역할, Props 정의
2. **state-management.md**: 상태 구조, 액션, 리듀서 정의
3. **i18n-keys.md**: 번역 키 및 한/영 텍스트
