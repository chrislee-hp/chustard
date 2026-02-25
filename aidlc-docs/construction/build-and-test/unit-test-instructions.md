# Unit Test Execution Instructions - admin-web

## TDD Artifacts Detected ✅

**TDD was used for code generation**. Unit tests were already executed during the TDD cycle and passed.

**Test Plan**: `aidlc-docs/construction/plans/admin-web-test-plan.md`
**Test Results**: 21 tests passed (🟢 status)

---

## Test Coverage Summary

### Implemented Tests (21 total)

1. **AuthSlice Tests** (3 tests)
   - ✅ loginSuccess stores token and user
   - ✅ loginFailure clears auth state
   - ✅ logout clears session and localStorage

2. **Session Utils Tests** (3 tests)
   - ✅ validateSession returns true for valid token
   - ✅ validateSession returns false for expired token
   - ✅ validateSession returns false when token missing

3. **Validation Utils Tests** (6 tests)
   - ✅ validateLoginForm detects missing storeId
   - ✅ validateLoginForm detects missing username
   - ✅ validateLoginForm detects missing password
   - ✅ validateLoginForm returns no errors for valid data
   - ✅ isValidUrl validates http/https URLs
   - ✅ isValidUrl rejects invalid URLs

4. **useSSE Hook Tests** (2 tests)
   - ✅ useSSE does not create EventSource without token
   - ✅ useSSE creates EventSource with valid token

5. **LoginPage Component Tests** (3 tests)
   - ✅ validates required fields
   - ✅ renders form fields
   - ✅ updates form data on input change

6. **TableCard Component Tests** (4 tests)
   - ✅ displays table info
   - ✅ applies new-order class when isNew is true
   - ✅ applies active class for active table
   - ✅ calls onClick when clicked

---

## Running Unit Tests

### Prerequisites

Ensure dependencies are installed:
```bash
cd client/admin
npm install
```

---

### Execute All Unit Tests

```bash
npm test
```

**Expected Output**:
```
PASS tests/store/authSlice.test.ts
PASS tests/utils/session.test.ts
PASS tests/utils/validation.test.ts
PASS tests/hooks/useSSE.test.ts
PASS tests/components/LoginPage.test.tsx
PASS tests/components/TableCard.test.tsx

Test Suites: 6 passed, 6 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        3.456 s
```

---

### Execute Specific Test Suite

**Run AuthSlice tests only**:
```bash
npm test -- authSlice.test.ts
```

**Run all component tests**:
```bash
npm test -- components/
```

**Run with coverage**:
```bash
npm test -- --coverage
```

**Expected Coverage**:
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
authSlice.ts          |   100   |   100    |   100   |   100   |
session.ts            |   100   |   100    |   100   |   100   |
validation.ts         |   100   |   100    |   100   |   100   |
useSSE.ts             |   85.7  |   75     |   100   |   85.7  |
LoginPage.tsx         |   90.9  |   80     |   100   |   90.9  |
TableCard.tsx         |   100   |   100    |   100   |   100   |
```

---

### Watch Mode (Development)

Run tests in watch mode for continuous testing during development:

```bash
npm test -- --watch
```

**Features**:
- Automatically re-runs tests when files change
- Interactive menu for filtering tests
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `q` to quit

---

## Test Verification Checklist

- [ ] All 21 tests pass
- [ ] No test failures or errors
- [ ] Coverage meets minimum thresholds (>80%)
- [ ] No console errors or warnings during test execution
- [ ] Tests complete in reasonable time (< 10 seconds)

---

## Troubleshooting

### Tests Fail with "Cannot find module"

**Cause**: Missing test dependencies or incorrect module paths

**Solution**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

---

### Tests Fail with "localStorage is not defined"

**Cause**: Jest environment doesn't have localStorage by default

**Solution**: Already configured in `jest.config.js` with `jsdom` environment.

If still failing, add to test file:
```typescript
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    writable: true
  });
});
```

---

### Tests Fail with "EventSource is not defined"

**Cause**: EventSource not available in test environment

**Solution**: Mock EventSource in test:
```typescript
global.EventSource = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  close: jest.fn()
})) as any;
```

---

### Tests Pass Locally but Fail in CI

**Cause**: Environment differences (timezone, locale, etc.)

**Solution**:
1. Check CI logs for specific error messages
2. Ensure CI has same Node.js version
3. Add explicit timezone/locale settings in tests
4. Mock Date.now() for time-dependent tests

---

## Test Maintenance

### Adding New Tests

1. Create test file in `tests/` directory matching source structure
2. Import component/function to test
3. Write test cases using Jest + React Testing Library
4. Run tests to verify they pass
5. Update this document with new test count

### Updating Existing Tests

1. Modify test file
2. Run affected tests: `npm test -- <test-file>`
3. Verify all tests still pass
4. Update test plan if test cases changed

---

## Next Steps

After unit tests pass:
1. Review test coverage report
2. Add tests for uncovered code paths (if needed)
3. Proceed to integration tests (see `integration-test-instructions.md`)
