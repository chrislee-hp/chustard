# Customer SPA - Business Rules

## 인증 규칙

| Rule ID | Rule | 처리 |
|---------|------|------|
| AUTH-01 | 토큰 만료 시 | 자동 재로그인 시도 (localStorage 정보) |
| AUTH-02 | 재로그인 실패 시 | localStorage 클리어, LoginSetupPage 이동 |
| AUTH-03 | table:completed 수신 시 | SessionExpiredPage 이동, 모든 동작 차단 |

---

## 장바구니 규칙

| Rule ID | Rule | 처리 |
|---------|------|------|
| CART-01 | 동일 메뉴 추가 시 | 수량 +1 (새 아이템 생성 안함) |
| CART-02 | 수량 감소로 0이 되면 | 아이템 자동 삭제 |
| CART-03 | 장바구니 변경 시 | 즉시 localStorage 동기화 |
| CART-04 | 주문 성공 시 | 장바구니 전체 클리어 |
| CART-05 | 주문 실패 시 | 장바구니 유지 |

---

## 주문 규칙

| Rule ID | Rule | 처리 |
|---------|------|------|
| ORDER-01 | 장바구니 비어있을 때 | "주문하기" 버튼 disabled |
| ORDER-02 | 주문 성공 후 | 5초 카운트다운 → 메뉴 화면 자동 이동 |
| ORDER-03 | 추가 주문 시 | 별도 안내 없이 동일 플로우 진행 |

---

## UI 규칙

| Rule ID | Rule | 처리 |
|---------|------|------|
| UI-01 | API 호출 중 | 해당 버튼에 인라인 스피너 표시 |
| UI-02 | API 에러 발생 시 | 토스트 알림 (3초 후 자동 사라짐) |
| UI-03 | 장바구니 패널 | 토글 버튼으로만 열림/닫힘 |
| UI-04 | 메뉴 그리드 | 반응형 2~4열 |

---

## i18n 규칙

| Rule ID | Rule | 처리 |
|---------|------|------|
| I18N-01 | 기본 언어 | 한국어 (ko) |
| I18N-02 | 언어 전환 시 | 즉시 반영, localStorage 저장 |
| I18N-03 | 가격 표시 | 항상 원화 (₩) |
| I18N-04 | 메뉴명/설명 | locale에 따라 ko/en 필드 사용 |
| I18N-05 | 주문 상태 | locale에 따라 한국어/영어 표시 |

---

## Validation Rules

| Field | Rule |
|-------|------|
| storeId | 필수, 비어있으면 안됨 |
| tableNumber | 필수, 양의 정수 |
| password | 필수, 비어있으면 안됨 |
| cart items | 주문 시 최소 1개 이상 |
