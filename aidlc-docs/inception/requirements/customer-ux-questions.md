# 고객 관점 요구사항 점검 - 추가 질문

고객 여정(Customer Journey)을 처음부터 끝까지 따라가며 점검한 결과,
아래 사항들에 대한 명확화가 필요합니다.

---

## Question 1
고객이 메뉴 카드를 탭했을 때의 동작은 어떻게 되나요?

A) 메뉴 카드 탭 → 바로 장바구니에 1개 추가 (빠른 주문)
B) 메뉴 카드 탭 → 상세 팝업/모달 표시 → 수량 선택 후 장바구니 추가
C) 메뉴 카드 탭 → 상세 페이지로 이동 → 수량 선택 후 장바구니 추가
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
장바구니 UI는 어떤 형태로 표시되나요?

A) 화면 하단 고정 바 (장바구니 아이콘 + 총 금액 + 수량 표시, 탭하면 장바구니 상세 펼침)
B) 별도 장바구니 페이지로 이동
C) 화면 우측 사이드 패널
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 3
고객 화면의 네비게이션 구조는 어떻게 되나요? (메뉴 조회와 주문 내역 간 이동)

A) 하단 탭 바 (메뉴 | 주문내역) - 2개 탭
B) 상단 탭 바 (메뉴 | 주문내역) - 2개 탭
C) 메뉴 화면에 "주문내역 보기" 버튼만 배치
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
주문 성공 후 "주문 번호 표시 → 메뉴 화면 자동 리다이렉트"에서, 주문 성공 화면은 어떤 형태인가요?

A) 전체 화면 성공 페이지 (주문 번호 + 주문 내역 요약 표시, 5초 후 자동 이동)
B) 토스트/스낵바 알림 (주문 번호만 간단히 표시, 바로 메뉴 화면)
C) 모달 팝업 (주문 번호 표시, 확인 버튼 또는 5초 후 자동 닫힘)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
장바구니에 담긴 메뉴의 수량이 0이 되면 어떻게 처리하나요?

A) 수량 0이 되면 자동으로 장바구니에서 삭제
B) 수량 최소값은 1이고, 삭제는 별도 삭제 버튼으로만 가능
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
고객이 추가 주문을 할 때 (이미 주문이 있는 상태에서 새 주문), 특별한 안내가 필요한가요?

A) 특별한 안내 없이 동일한 주문 플로우 진행 (새 주문 번호 발급)
B) "추가 주문입니다" 안내 메시지 표시 후 진행
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
테이블 세션이 만료되었거나 관리자가 이용 완료 처리한 경우, 고객 화면에서는 어떻게 표시되나요?

A) "이용이 종료되었습니다. 직원에게 문의해주세요" 안내 화면 표시
B) 자동으로 초기 로그인 화면으로 이동
C) 별도 처리 없이 다음 주문 시 에러 메시지 표시
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
빈 장바구니 상태에서 "주문하기" 버튼은 어떻게 처리하나요?

A) 주문하기 버튼 비활성화 (disabled)
B) 버튼은 활성화되어 있지만 탭 시 "장바구니가 비어있습니다" 안내
C) 장바구니가 비어있으면 주문하기 버튼 자체를 숨김
D) Other (please describe after [Answer]: tag below)

[Answer]: A
