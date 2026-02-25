# Unit Test Execution

## TDD Artifacts Detected
모든 Unit은 TDD로 개발되어 테스트가 이미 통과된 상태입니다.

## Run All Unit Tests (Verification)

### API Server (Jest)
```bash
cd server && npx jest --forceExit --verbose
# Expected: 71 tests passed
```

### Customer SPA (Vitest)
```bash
cd client/customer && npx vitest run
# Expected: 14 tests passed
```

### Admin SPA (Vitest)
```bash
cd client/admin && npx vitest run
# Expected: 7 tests passed
```

### Run All at Once
```bash
cd server && npx jest --forceExit 2>&1 | grep 'Tests:' && \
cd ../client/customer && npx vitest run 2>&1 | grep 'Tests' && \
cd ../admin && npx vitest run 2>&1 | grep 'Tests'
```

## Test Summary
| Unit | Framework | Tests | Status |
|---|---|---|---|
| API Server | Jest | 71 | ✅ Passed |
| Customer SPA | Vitest | 14 | ✅ Passed |
| Admin SPA | Vitest | 7 | ✅ Passed |
| **Total** | | **92** | **✅ All Passed** |
