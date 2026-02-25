# Unit 1: API Server - TDD Code Generation Plan

## Unit Context
- **Unit Name**: API Server (Backend)
- **Type**: Node.js (Express)
- **Directory**: `server/`
- **Approach**: TDD (Test-Driven Development)

## Tech Stack
- Runtime: Node.js
- Framework: Express
- Database: SQLite (better-sqlite3)
- Auth: jsonwebtoken, bcrypt
- Validation: express-validator
- Test: Jest, supertest

---

## TDD Execution Plan

### Phase 1: Project Setup
- [x] 1.1 package.json 생성 (dependencies, scripts)
- [x] 1.2 프로젝트 구조 생성 (src/, tests/)
- [x] 1.3 Jest 설정 (jest.config.js)
- [x] 1.4 DB 스키마 및 seed 스크립트

### Phase 2: Repository Layer (RED → GREEN → REFACTOR)
- [x] 2.1 AdminRepository 테스트 작성 → 구현
- [x] 2.2 TableRepository 테스트 작성 → 구현
- [x] 2.3 CategoryRepository 테스트 작성 → 구현
- [x] 2.4 MenuRepository 테스트 작성 → 구현
- [x] 2.5 OrderRepository 테스트 작성 → 구현
- [x] 2.6 LoginAttemptRepository 테스트 작성 → 구현

### Phase 3: Service Layer (RED → GREEN → REFACTOR)
- [x] 3.1 AuthService 테스트 작성 → 구현
- [x] 3.2 MenuService 테스트 작성 → 구현
- [x] 3.3 OrderService 테스트 작성 → 구현
- [x] 3.4 TableService 테스트 작성 → 구현
- [x] 3.5 SSEService 테스트 작성 → 구현

### Phase 4: API Routes (Integration Tests)
- [x] 4.1 Auth API 구현
- [x] 4.2 Menu API 구현
- [x] 4.3 Order API 구현
- [x] 4.4 Table API 구현
- [x] 4.5 SSE API 구현

### Phase 5: Middleware & App Assembly
- [x] 5.1 Auth middleware 구현
- [x] 5.2 Validation middleware (inline)
- [x] 5.3 Error handler
- [x] 5.4 App entry point (index.js)

---

## Directory Structure

```
server/
├── src/
│   ├── app.js              # Express app setup
│   ├── index.js            # Entry point
│   ├── db/
│   │   ├── schema.sql      # DDL
│   │   ├── seed.sql        # Initial data
│   │   └── database.js     # DB connection
│   ├── repositories/
│   │   ├── adminRepository.js
│   │   ├── tableRepository.js
│   │   ├── categoryRepository.js
│   │   ├── menuRepository.js
│   │   ├── orderRepository.js
│   │   └── loginAttemptRepository.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── menuService.js
│   │   ├── orderService.js
│   │   ├── tableService.js
│   │   └── sseService.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── tableRoutes.js
│   │   └── sseRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   └── utils/
│       └── imageValidator.js
├── tests/
│   ├── repositories/
│   ├── services/
│   ├── routes/
│   └── setup.js            # Test DB setup
├── package.json
└── jest.config.js
```

---

## Test Coverage Targets

| Layer | Coverage |
|-------|----------|
| Repository | 90%+ |
| Service | 90%+ |
| Routes | 80%+ |

---

## Approval Required

위 TDD Code Generation Plan을 승인하시겠습니까?

A) 승인 - 코드 생성 시작
B) 수정 요청 - Plan 변경

[Answer]:
