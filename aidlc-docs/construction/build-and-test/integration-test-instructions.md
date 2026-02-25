# Integration Test Instructions - admin-web

## Overview

Integration tests verify that multiple units work together correctly. For admin-web, this includes:
- Redux store + Components integration
- API client + Redux thunks integration
- SSE events + Redux state updates
- Component interactions and data flow

---

## Test Scope

### 1. Redux Store Integration

**Test**: LoginPage + AuthSlice integration
- User fills login form
- Form submits and dispatches loginRequest
- AuthSlice updates state
- Component navigates to dashboard

**Test**: TableCard + Dashboard state
- TableCard receives table data from Redux
- Click event dispatches action
- Side panel opens based on Redux state

---

### 2. API Integration (Mock Server)

**Setup**: Use MSW (Mock Service Worker) for API mocking

**Test scenarios**:
- Login API call success/failure
- Fetch tables API call
- Update order status API call
- SSE connection and events

---

### 3. SSE Integration

**Test**: SSE events update Redux state
- Establish SSE connection
- Receive order:created event
- Redux state updates with new order
- Components re-render with new data

---

## Running Integration Tests

### Prerequisites

Install additional dependencies:
```bash
cd client/admin
npm install --save-dev msw
```

---

### Execute Integration Tests

**Note**: Integration tests are NOT yet implemented in this demo scope.

**To implement**:
1. Create `tests/integration/` directory
2. Setup MSW handlers for API mocking
3. Write integration test scenarios
4. Run with: `npm test -- integration/`

---

## Example Integration Test Structure

```typescript
// tests/integration/login-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { store } from '../../src/store/store';
import { App } from '../../src/App';

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      user: { id: '1', username: 'admin', storeId: 'store-1', role: 'admin' },
      token: 'mock-token',
      expiresIn: 57600
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Login Flow Integration', () => {
  it('should login and navigate to dashboard', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // Fill login form
    fireEvent.change(screen.getByPlaceholderText('store-123'), {
      target: { value: 'store-1' }
    });
    fireEvent.change(screen.getByPlaceholderText('admin'), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'password' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));

    // Wait for navigation
    await waitFor(() => {
      expect(window.location.pathname).toBe('/admin/orders');
    });

    // Verify Redux state
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
```

---

## Integration Test Checklist

- [ ] Redux store + Components integration tested
- [ ] API calls mocked with MSW
- [ ] SSE events tested with mock EventSource
- [ ] Navigation flows tested
- [ ] Error scenarios tested
- [ ] Loading states tested

---

## Future Integration Tests (Not Implemented)

### Recommended Test Scenarios

1. **Complete Login Flow**
   - Login → Dashboard → Logout

2. **Order Management Flow**
   - View orders → Update status → Verify state change

3. **SSE Real-time Updates**
   - Connect SSE → Receive event → UI updates

4. **Menu Management Flow**
   - Create menu → Edit menu → Delete menu

5. **Error Handling**
   - API failure → Error message displayed
   - Network error → Retry mechanism

---

## Next Steps

After integration tests (when implemented):
1. Review test results
2. Fix any integration issues
3. Proceed to performance tests (if applicable)
4. Proceed to build-and-test summary
