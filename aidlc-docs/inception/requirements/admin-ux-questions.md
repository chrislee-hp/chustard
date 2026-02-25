# 관리자 관점 요구사항 점검 - 추가 질문

관리자 여정(Admin Journey)을 처음부터 끝까지 따라가며 점검한 결과,
아래 사항들에 대한 명확화가 필요합니다.

---

## Question 1
관리자 화면의 메인 네비게이션 구조는 어떻게 되나요?

A) 좌측 사이드바 메뉴 (주문 모니터링 | 메뉴 관리)
B) 상단 탭/네비게이션 바 (주문 모니터링 | 메뉴 관리)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
관리자가 로그인 후 처음 보는 기본 화면은 무엇인가요?

A) 실시간 주문 모니터링 대시보드
B) 메뉴 관리 화면
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
주문 모니터링 대시보드에서 테이블 카드의 "최신 주문 n개 미리보기"에서 n은 몇 개가 적당한가요?

A) 최신 1개
B) 최신 3개
C) 최신 5개
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
주문 상태 변경(대기중→준비중→완료) 시 UI 동작은 어떻게 되나요?

A) 상태 변경 버튼 클릭 → 즉시 다음 상태로 변경 (대기중→준비중→완료 순차)
B) 상태 변경 버튼 클릭 → 드롭다운에서 원하는 상태 선택
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
테이블 카드 클릭 시 주문 상세 보기는 어떤 형태인가요?

A) 모달/팝업으로 표시
B) 사이드 패널로 표시
C) 별도 페이지로 이동
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
테이블 태블릿 초기 설정은 어디서 수행하나요?

A) 관리자 화면의 테이블 관리 메뉴에서 설정 (관리자가 테이블 번호/비밀번호 생성 후, 태블릿에서 입력)
B) 태블릿에서 직접 설정 화면 접근 (관리자가 태블릿 앞에서 직접 설정)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
로그인 시도 제한은 몇 회로 설정하나요? 제한 초과 시 동작은?

A) 5회 실패 → 5분간 로그인 차단
B) 5회 실패 → 30분간 로그인 차단
C) 3회 실패 → 5분간 로그인 차단
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
카테고리 관리 기능이 필요한가요? (메뉴 관리에서 카테고리별 분류가 있으므로)

A) 카테고리 CRUD 기능 포함 (카테고리 추가/수정/삭제/순서 조정)
B) 카테고리는 사전 정의 (seed data), 관리 기능 불필요
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
주문 삭제 시 삭제된 주문은 어떻게 처리되나요?

A) 완전 삭제 (DB에서 제거)
B) 소프트 삭제 (삭제 플래그 처리, 과거 내역에서 "삭제됨"으로 표시)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10
관리자가 현재 활성 테이블(주문이 있는 테이블)과 비활성 테이블(주문이 없는 테이블)을 구분할 수 있어야 하나요?

A) 예, 대시보드에서 활성/비활성 테이블을 시각적으로 구분 표시
B) 아니오, 모든 테이블을 동일하게 표시
C) 활성 테이블만 대시보드에 표시 (비활성 테이블은 숨김)
D) Other (please describe after [Answer]: tag below)

[Answer]: A
