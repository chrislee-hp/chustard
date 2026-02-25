# Requirements Verification Questions

테이블오더 서비스 요구사항을 분석한 결과, 아래 사항들에 대한 명확화가 필요합니다.
각 질문의 [Answer]: 태그 뒤에 선택지 알파벳을 입력해 주세요.

---

## Question 1
프론트엔드 기술 스택은 무엇을 사용하시겠습니까?

A) React (SPA)
B) Next.js (SSR/SSG)
C) Vue.js
D) Vanilla HTML/CSS/JavaScript
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
백엔드 기술 스택은 무엇을 사용하시겠습니까?

A) Node.js (Express/Fastify)
B) Python (FastAPI/Django)
C) Java (Spring Boot)
D) Go
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
데이터베이스는 무엇을 사용하시겠습니까?

A) PostgreSQL
B) MySQL
C) Amazon DynamoDB
D) MongoDB
E) Other (please describe after [Answer]: tag below)

[Answer]: E - SQLite

## Question 4
배포 환경은 어디를 대상으로 하시겠습니까?

A) AWS (EC2/ECS/Lambda 등 클라우드)
B) 로컬 서버 (Docker Compose 등)
C) 로컬 개발 환경만 (MVP 검증용)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5
매장(Store)은 단일 매장만 지원하면 되나요, 아니면 멀티 매장을 지원해야 하나요?

A) 단일 매장 (하나의 매장만 운영)
B) 멀티 매장 (여러 매장을 하나의 시스템에서 관리)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
관리자 계정은 어떻게 생성되나요?

A) 시스템에 사전 등록 (seed data 또는 CLI로 생성)
B) 관리자 회원가입 기능 포함
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
메뉴 이미지는 어떻게 관리하시겠습니까?

A) 외부 URL 직접 입력 (이미지 호스팅은 별도)
B) 서버에 이미지 업로드 기능 포함
C) 이미지 없이 텍스트만 (MVP 단계)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
테이블 수는 매장당 최대 몇 개 정도를 예상하시나요?

A) 10개 이하 (소규모 매장)
B) 11~30개 (중규모 매장)
C) 31~50개 (대규모 매장)
D) 50개 이상
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
고객용 인터페이스의 언어는 무엇을 지원하나요?

A) 한국어만
B) 한국어 + 영어
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10
주문 상태 변경 시 고객 화면에 실시간 반영이 필요한가요? (요구사항에 "선택사항"으로 표기됨)

A) 예, MVP에 포함 (SSE로 고객 화면에도 실시간 상태 업데이트)
B) 아니오, MVP에서 제외 (고객은 새로고침으로 확인)
C) Other (please describe after [Answer]: tag below)

[Answer]: A
