# Admin Web

관리자용 주문 모니터링 및 메뉴 관리 시스템

## 기능

- **인증**: 로그인/로그아웃, 세션 관리 (16시간)
- **주문 모니터링**: 실시간 테이블 상태, 주문 상세 보기
- **메뉴 관리**: 메뉴 CRUD 작업

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 빌드

```bash
npm run build
```

## 테스트

### Unit Tests

```bash
npm test              # 단일 실행
npm run test:watch    # watch 모드
```

### E2E Tests

```bash
npm run test:e2e      # headless 모드
npm run test:e2e:ui   # UI 모드
```

## 기술 스택

- **React 18** - UI 라이브러리
- **Redux Toolkit** - 상태 관리
- **TypeScript** - 타입 안전성
- **React Router v6** - 라우팅
- **Vite** - 빌드 도구
- **Jest** - Unit 테스트
- **Playwright** - E2E 테스트

## 프로젝트 구조

```
src/
├── components/       # React 컴포넌트
├── store/           # Redux 스토어 및 슬라이스
├── hooks/           # 커스텀 훅
├── utils/           # 유틸리티 함수
├── types/           # TypeScript 타입 정의
├── App.tsx          # 메인 앱 컴포넌트
└── index.tsx        # 엔트리 포인트
```

## 로그인 정보 (Mock)

- **매장 식별자**: store-1
- **사용자명**: admin
- **비밀번호**: password123

## 참고사항

- 현재 Mock 데이터를 사용하는 프로토타입입니다
- 실제 API 연동 시 `src/store/slices/` 파일들의 thunk 구현 필요
- TODO 주석을 참고하여 실제 API 호출로 교체하세요
