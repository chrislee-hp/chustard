# Test Plan for admin-web

## Unit Overview
- **Unit**: admin-web (Unit 3)
- **Type**: React SPA with Redux Toolkit
- **Stories**: US-2.1 ~ US-2.9
- **Requirements**: REQ-AUTH, REQ-DASHBOARD, REQ-ORDER-MGMT, REQ-MENU-MGMT

---

## Test Strategy

**Testing Approach**:
- Redux slices: Unit tests (actions, reducers, thunks)
- Custom hooks: React Testing Library
- Components: React Testing Library + user interactions
- Utilities: Unit tests
- Integration: Component + Redux integration

**Test Framework**: Jest + React Testing Library

---

## Redux Slices Tests

### AuthSlice Tests

**TC-admin-001**: Login success stores token and user
- Given: Valid credentials
- When: loginRequest dispatched
- Then: token stored in localStorage, user in state, isAuthenticated = true
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-002**: Login failure shows error
- Given: Invalid credentials
- When: loginRequest dispatched
- Then: loginFailure action, error message set
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-003**: Logout clears session
- Given: Authenticated user
- When: logout dispatched
- Then: token removed from localStorage, state cleared
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-004**: Session restoration from localStorage
- Given: Valid token in localStorage
- When: restoreSession dispatched
- Then: User restored, isAuthenticated = true
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-005**: Session expiry validation
- Given: Expired token in localStorage
- When: validateSession called
- Then: Returns false, token removed
- Story: US-2.1
- Status: ⬜ Not Started

---

### DashboardSlice Tests

**TC-admin-006**: Fetch tables success
- Given: API returns tables
- When: fetchTables dispatched
- Then: tables array populated in state
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-007**: Select table opens side panel
- Given: Dashboard with tables
- When: selectTable + openSidePanel dispatched
- Then: selectedTableId set, sidePanelOpen = true
- Story: US-2.3
- Status: ⬜ Not Started

**TC-admin-008**: New order marked and auto-cleared
- Given: Order received via SSE
- When: markOrderAsNew dispatched, wait 5s
- Then: orderId in newOrderIds, then removed after 5s
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-009**: Order received updates table
- Given: Existing table in state
- When: orderReceived dispatched
- Then: Order added to table.orders, totalAmount updated
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-010**: Order deleted removes from table
- Given: Table with orders
- When: orderDeleted dispatched
- Then: Order removed, totalAmount recalculated
- Story: US-2.5
- Status: ⬜ Not Started

---

### OrdersSlice Tests

**TC-admin-011**: Update order status success
- Given: Order with status 'pending'
- When: updateOrderStatus('preparing') dispatched
- Then: API called, order status updated in state
- Story: US-2.3
- Status: ⬜ Not Started

**TC-admin-012**: Delete order soft deletes
- Given: Existing order
- When: deleteOrder dispatched
- Then: API called, order.deletedAt set
- Story: US-2.5
- Status: ⬜ Not Started

**TC-admin-013**: Complete session clears table
- Given: Table with active session
- When: completeSession dispatched
- Then: API called, table orders moved to history
- Story: US-2.6
- Status: ⬜ Not Started

---

### OrderHistorySlice Tests

**TC-admin-014**: Fetch order history initial load
- Given: Table ID
- When: fetchOrderHistory dispatched
- Then: Historical orders loaded, hasMore/nextCursor set
- Story: US-2.7
- Status: ⬜ Not Started

**TC-admin-015**: Load more history (infinite scroll)
- Given: Existing history with hasMore = true
- When: loadMoreHistory dispatched
- Then: Additional orders appended, cursor updated
- Story: US-2.7
- Status: ⬜ Not Started

---

### MenuManagementSlice Tests

**TC-admin-016**: Fetch menus and categories
- Given: API returns menus and categories
- When: fetchMenus + fetchCategories dispatched
- Then: menus and categories arrays populated
- Story: US-2.8, US-2.9
- Status: ⬜ Not Started

**TC-admin-017**: Create menu success
- Given: Valid menu form data
- When: createMenu dispatched
- Then: API called, new menu added to state
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-018**: Update menu success
- Given: Existing menu, valid form data
- When: updateMenu dispatched
- Then: API called, menu updated in state
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-019**: Delete menu success
- Given: Existing menu
- When: deleteMenu dispatched
- Then: API called, menu removed from state
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-020**: Move menu up swaps display order
- Given: Menu at index 1
- When: moveMenuUp dispatched
- Then: displayOrder swapped with menu at index 0
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-021**: Move menu down swaps display order
- Given: Menu at index 0
- When: moveMenuDown dispatched
- Then: displayOrder swapped with menu at index 1
- Story: US-2.8
- Status: ⬜ Not Started

---

### SSESlice Tests

**TC-admin-022**: SSE connection status transitions
- Given: SSE hook initialized
- When: Connection opens
- Then: status = 'connected'
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-023**: SSE reconnection with exponential backoff
- Given: SSE connection error
- When: Reconnection triggered
- Then: Delay increases exponentially (1s, 2s, 4s, ..., max 30s)
- Story: US-2.2
- Status: ⬜ Not Started

---

## Custom Hooks Tests

### useSSE Tests

**TC-admin-024**: useSSE establishes connection
- Given: Component using useSSE
- When: Component mounts
- Then: EventSource created with token
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-025**: useSSE handles order:created event
- Given: SSE connected
- When: order:created event received
- Then: orderReceived dispatched, notification sound played
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-026**: useSSE handles order:updated event
- Given: SSE connected
- When: order:updated event received
- Then: orderUpdated dispatched
- Story: US-2.3
- Status: ⬜ Not Started

**TC-admin-027**: useSSE handles order:deleted event
- Given: SSE connected
- When: order:deleted event received
- Then: orderDeleted dispatched
- Story: US-2.5
- Status: ⬜ Not Started

**TC-admin-028**: useSSE closes connection on unmount
- Given: Component with useSSE
- When: Component unmounts
- Then: EventSource.close() called
- Story: US-2.2
- Status: ⬜ Not Started

---

## Component Tests

### LoginPage Tests

**TC-admin-029**: Login form validates required fields
- Given: Empty form
- When: Submit clicked
- Then: Alert shown, no API call
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-030**: Login form submits valid data
- Given: Valid credentials entered
- When: Submit clicked
- Then: loginRequest dispatched, navigates to /admin/orders
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-031**: Login form shows error on failure
- Given: Invalid credentials
- When: Submit clicked
- Then: Alert shown with error message
- Story: US-2.1
- Status: ⬜ Not Started

---

### OrderMonitoringTab Tests

**TC-admin-032**: Dashboard fetches tables on mount
- Given: Component mounts
- When: useEffect runs
- Then: fetchTables dispatched
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-033**: Dashboard polls every 5 minutes
- Given: Component mounted
- When: 5 minutes pass
- Then: fetchTables dispatched again
- Story: US-2.2
- Status: ⬜ Not Started

---

### TableCard Tests

**TC-admin-034**: TableCard displays table info
- Given: Table with orders
- When: Rendered
- Then: Shows table number, total amount, order count
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-035**: TableCard shows new order animation
- Given: isNew = true
- When: Rendered
- Then: 'new-order' class applied
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-036**: TableCard click opens side panel
- Given: TableCard rendered
- When: Card clicked
- Then: onClick callback fired
- Story: US-2.3
- Status: ⬜ Not Started

---

### OrderList Tests

**TC-admin-037**: OrderList status change (no confirm)
- Given: Order with status 'pending'
- When: Status button clicked
- Then: updateOrderStatus dispatched immediately
- Story: US-2.3
- Status: ⬜ Not Started

**TC-admin-038**: OrderList status change (confirm for completed)
- Given: Order with status 'preparing'
- When: Status button clicked
- Then: Confirm dialog shown, dispatched on confirm
- Story: US-2.3
- Status: ⬜ Not Started

**TC-admin-039**: OrderList delete 2-step confirmation
- Given: Order in list
- When: Delete clicked twice (confirm both)
- Then: deleteOrder dispatched
- Story: US-2.5
- Status: ⬜ Not Started

**TC-admin-040**: OrderList delete cancellation
- Given: Order in list
- When: Delete clicked, cancel on step 1
- Then: No API call, order remains
- Story: US-2.5
- Status: ⬜ Not Started

---

### MenuListView Tests

**TC-admin-041**: MenuListView filters by category
- Given: Menus with different categories
- When: Category selected in dropdown
- Then: Only menus of that category shown
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-042**: MenuListView move up button
- Given: Menu at index 1
- When: Up button clicked
- Then: moveMenuUp dispatched
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-043**: MenuListView move down button
- Given: Menu at index 0
- When: Down button clicked
- Then: moveMenuDown dispatched
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-044**: MenuListView delete with confirmation
- Given: Menu in list
- When: Delete clicked, confirmed
- Then: deleteMenu dispatched
- Story: US-2.8
- Status: ⬜ Not Started

---

### MenuCreatePage Tests

**TC-admin-045**: MenuCreatePage validates required fields
- Given: Empty form
- When: Submit clicked
- Then: Alert shown, no API call
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-046**: MenuCreatePage validates URL format
- Given: Invalid image URL
- When: Submit clicked
- Then: Alert shown, no API call
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-047**: MenuCreatePage submits valid data
- Given: Valid form data
- When: Submit clicked
- Then: createMenu dispatched, navigates to /admin/menus
- Story: US-2.8
- Status: ⬜ Not Started

---

## Utility Function Tests

### Session Management Tests

**TC-admin-048**: validateSession returns true for valid token
- Given: Valid token and expiry in localStorage
- When: validateSession called
- Then: Returns true
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-049**: validateSession returns false for expired token
- Given: Expired token in localStorage
- When: validateSession called
- Then: Returns false, token removed
- Story: US-2.1
- Status: ⬜ Not Started

---

### Data Transformation Tests

**TC-admin-050**: aggregateTableOrders calculates totals
- Given: Array of orders
- When: aggregateTableOrders called
- Then: Returns correct totalAmount, orderCount, lastOrderAt
- Story: US-2.2
- Status: ⬜ Not Started

**TC-admin-051**: sortMenusByDisplayOrder sorts correctly
- Given: Unsorted menus
- When: sortMenusByDisplayOrder called
- Then: Menus sorted by displayOrder ascending
- Story: US-2.8
- Status: ⬜ Not Started

---

### Form Validation Tests

**TC-admin-052**: validateLoginForm detects missing fields
- Given: Form with missing storeId
- When: validateLoginForm called
- Then: Returns error for storeId field
- Story: US-2.1
- Status: ⬜ Not Started

**TC-admin-053**: validateMenuForm detects invalid price
- Given: Form with price = 0
- When: validateMenuForm called
- Then: Returns error for price field
- Story: US-2.8
- Status: ⬜ Not Started

**TC-admin-054**: isValidUrl validates URL format
- Given: URL without http/https
- When: isValidUrl called
- Then: Returns false
- Story: US-2.8
- Status: ⬜ Not Started

---

### API Error Handling Tests

**TC-admin-055**: handleApiError shows alert for 500
- Given: API error with status 500
- When: handleApiError called
- Then: Alert shown with server error message
- Story: All
- Status: ⬜ Not Started

**TC-admin-056**: handleApiError redirects on 401
- Given: API error with status 401
- When: handleApiError called
- Then: Alert shown, redirects to /login
- Story: All
- Status: ⬜ Not Started

---

## Requirements Coverage

| Requirement ID | Test Cases | Status |
|---------------|------------|--------|
| REQ-AUTH | TC-admin-001~005, TC-admin-029~031, TC-admin-048~049, TC-admin-052 | ⬜ Pending |
| REQ-DASHBOARD | TC-admin-006~010, TC-admin-032~036, TC-admin-050 | ⬜ Pending |
| REQ-ORDER-MGMT | TC-admin-011~015, TC-admin-037~040 | ⬜ Pending |
| REQ-MENU-MGMT | TC-admin-016~021, TC-admin-041~047, TC-admin-051, TC-admin-053~054 | ⬜ Pending |
| REQ-SSE | TC-admin-022~028 | ⬜ Pending |
| REQ-ERROR-HANDLING | TC-admin-055~056 | ⬜ Pending |

**Total Test Cases**: 56

---

## Test Execution Summary

- **Total**: 56 test cases
- **Passed**: 0
- **Failed**: 0
- **Pending**: 56
