# TDD Code Generation Plan - API Server

## Unit Context
- **Workspace Root**: /Users/chrislee/Git/chustard
- **Project Type**: Greenfield (multi-unit monorepo)
- **Code Location**: `server/`
- **Test Framework**: Jest
- **Stories**: US-1.1~1.8, US-2.1~2.9

---

### Plan Step 0: Project Setup + Contract Skeletons
- [x] Initialize `server/` with package.json (express, better-sqlite3, bcryptjs, jsonwebtoken, uuid, cors)
- [x] Jest config + dev dependencies (jest, supertest)
- [x] DB schema (`server/src/db/schema.sql`) + init script
- [x] Generate all Repository skeletons (NotImplementedError)
- [x] Generate all Service skeletons (NotImplementedError)
- [x] Generate all Route skeletons (501 Not Implemented)
- [x] Generate middleware skeleton (auth)
- [x] Generate app.js (Express setup)
- [x] Verify: `npm test` runs (all tests skip/fail as expected)

### Plan Step 1: Repository Layer (TDD)
- [x] AdminRepository.findByStoreAndUsername - RED/GREEN/REFACTOR (TC-R-001, TC-R-002)
- [x] AdminRepository.updateLoginAttempt - RED/GREEN/REFACTOR
- [x] TableRepository.create - RED/GREEN/REFACTOR (TC-R-003)
- [x] TableRepository.findByStoreAndNumber - RED/GREEN/REFACTOR (TC-R-004)
- [x] TableRepository.findAllByStore - RED/GREEN/REFACTOR (TC-R-005)
- [x] TableRepository.updateSession - RED/GREEN/REFACTOR (TC-R-006)
- [x] CategoryRepository CRUD + sortOrder - RED/GREEN/REFACTOR (TC-R-007~012)
- [x] MenuRepository CRUD + grouped query - RED/GREEN/REFACTOR (TC-R-013~017)
- [x] OrderRepository create + queries - RED/GREEN/REFACTOR (TC-R-018~023)
- [x] OrderHistoryRepository - RED/GREEN/REFACTOR (TC-R-024~025)

### Plan Step 2: Service Layer (TDD)
- [x] AuthService.adminLogin - RED/GREEN/REFACTOR (TC-S-001~005) [US-2.1]
- [x] AuthService.tableLogin - RED/GREEN/REFACTOR (TC-S-006~007) [US-1.1]
- [x] AuthService.verifyToken - RED/GREEN/REFACTOR (TC-S-008~009)
- [x] MenuService.getMenus - RED/GREEN/REFACTOR (TC-S-010) [US-1.2]
- [x] MenuService.createMenu + reorder - RED/GREEN/REFACTOR (TC-S-011, TC-S-014) [US-2.8]
- [x] MenuService.deleteCategory (with validation) - RED/GREEN/REFACTOR (TC-S-012~013) [US-2.9]
- [x] OrderService.createOrder - RED/GREEN/REFACTOR (TC-S-015~017) [US-1.5, US-2.2]
- [x] OrderService.updateOrderStatus - RED/GREEN/REFACTOR (TC-S-018~020) [US-2.3, US-1.6]
- [x] OrderService.deleteOrder - RED/GREEN/REFACTOR (TC-S-021) [US-2.5]
- [x] TableService.createTable - RED/GREEN/REFACTOR (TC-S-022~023) [US-2.4]
- [x] TableService.completeTable - RED/GREEN/REFACTOR (TC-S-024) [US-2.6]
- [x] SSEService - RED/GREEN/REFACTOR (TC-S-025~026) [US-1.6, US-2.2]

### Plan Step 3: API Layer (TDD)
- [x] Auth routes - RED/GREEN/REFACTOR (TC-A-001~005)
- [x] Menu routes - RED/GREEN/REFACTOR (TC-A-006~009)
- [x] Order routes - RED/GREEN/REFACTOR (TC-A-010~015)
- [x] Table routes - RED/GREEN/REFACTOR (TC-A-016~017)
- [x] SSE route - RED/GREEN/REFACTOR (TC-A-018)

### Plan Step 4: Additional Artifacts
- [x] Seed data script (admin 계정, 샘플 카테고리/메뉴)
- [x] Entry point (`server/src/index.js`)
- [x] README.md (server 실행 방법)
