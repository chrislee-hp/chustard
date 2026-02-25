# Unit 2: Customer SPA - Functional Design Plan

## Unit Context
- **Unit Name**: Customer SPA
- **Type**: React SPA
- **Directory**: `client/customer/`
- **담당 Stories**: US-1.1 ~ US-1.8 (고객 주문 여정)

---

## Functional Design Plan

### Part 1: 질문 수집

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 뒤에 선택지(A, B, C 등)를 입력하세요.

---

#### Q1. 메뉴 카드 레이아웃
메뉴 카드의 그리드 레이아웃을 어떻게 구성할까요?

A) 2열 고정 (태블릿 최적화)
B) 반응형 (화면 크기에 따라 2~4열)
C) 1열 리스트 형태

[Answer]: B

---

#### Q2. 장바구니 사이드 패널 동작
장바구니 사이드 패널의 기본 상태는?

A) 항상 열려있음 (고정)
B) 기본 닫힘, 아이템 추가 시 자동 열림
C) 기본 닫힘, 토글 버튼으로만 열림

[Answer]: C

---

#### Q3. 주문 성공 후 자동 이동
주문 성공 화면에서 5초 후 자동 이동 시, 카운트다운을 표시할까요?

A) 예, "5초 후 메뉴 화면으로 이동합니다" + 카운트다운
B) 아니오, 카운트다운 없이 자동 이동만

[Answer]: A

---

#### Q4. 언어 전환 버튼 위치
언어 전환 버튼(🇰🇷/🇺🇸)의 위치는?

A) 상단 헤더 우측
B) 하단 고정 영역
C) 메뉴 화면에서만 표시

[Answer]: A

---

#### Q5. 주문 내역 화면 진입점
"주문내역 보기" 버튼의 위치는?

A) 상단 헤더에 항상 표시
B) 장바구니 패널 내부
C) 하단 네비게이션 바

[Answer]: A

---

#### Q6. 세션 만료 화면 디자인
세션 만료 안내 화면에서 어떤 동작을 제공할까요?

A) 안내 메시지만 표시 (직원 호출 안내)
B) "새로고침" 버튼 제공 (재로그인 시도)
C) 둘 다 제공

[Answer]: A

---

#### Q7. 로딩 상태 표시
API 호출 중 로딩 상태를 어떻게 표시할까요?

A) 전체 화면 로딩 스피너
B) 해당 영역만 스켈레톤 UI
C) 버튼/영역 내 인라인 스피너

[Answer]: C

---

#### Q8. 에러 메시지 표시 방식
API 에러 발생 시 메시지 표시 방식은?

A) 토스트 알림 (자동 사라짐)
B) 모달 팝업 (확인 버튼 필요)
C) 인라인 에러 메시지

[Answer]: A

---

#### Q9. State 관리 라이브러리
React에서 전역 상태 관리를 어떻게 할까요?

A) React Context만 (외부 라이브러리 없음)
B) Zustand (경량)
C) Redux Toolkit
D) Jotai

[Answer]: A

---

#### Q10. SSE 구현 방식
SSE 연결을 어떻게 구현할까요?

A) 커스텀 Hook 직접 구현 (`EventSource` API)
B) `@microsoft/fetch-event-source` (재연결 로직 내장)

[Answer]: A

---

#### Q11. HTTP Client
API 호출에 사용할 HTTP Client는?

A) fetch API (내장)
B) axios
C) ky (경량 fetch wrapper)

[Answer]: B

---

### Part 2: 실행 계획

질문 응답 완료 후 아래 순서로 Functional Design 산출물을 생성합니다.

- [x] Step 1: Component Hierarchy 정의 (페이지, 컴포넌트 구조)
- [x] Step 2: State Management 설계 (전역/로컬 상태, localStorage)
- [x] Step 3: Business Logic 정의 (장바구니 로직, 주문 플로우)
- [x] Step 4: API Integration Points 매핑 (컴포넌트별 API 연결)
- [x] Step 5: i18n 구조 설계 (번역 키, 언어 전환 로직)
- [x] Step 6: 산출물 파일 생성

---

## Output Artifacts

생성될 파일:
- `aidlc-docs/construction/customer-spa/functional-design/frontend-components.md`
- `aidlc-docs/construction/customer-spa/functional-design/business-logic-model.md`
- `aidlc-docs/construction/customer-spa/functional-design/business-rules.md`
