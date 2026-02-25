# Business Logic Model - admin-web

## Overview
Admin SPA의 클라이언트 측 비즈니스 로직, 데이터 변환, 상태 관리 로직

---

## 1. Authentication Logic

### Login Flow

```typescript
// Redux Thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { storeId: string; username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    const { user, token, expiresIn } = response.data;
    
    // localStorage 저장
    localStorage.setItem('admin_token', token);
    localStorage.setItem('token_expiry', String(Date.now() + expiresIn * 1000));
    
    return { user, token };
  }
);
```

### Session Validation

```typescript
export const validateSession = (): boolean => {
  const token = localStorage.getItem('admin_token');
  const expiry = localStorage.getItem('token_expiry');
  
  if (!token || !expiry) return false;
  
  const isExpired = Date.now() > Number(expiry);
  if (isExpired) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token_expiry');
    return false;
  }
  
  return true;
};
```

### Auto-logout on Expiry

```typescript
// Middleware
export const sessionMiddleware = (store) => (next) => (action) => {
  if (!validateSession() && store.getState().auth.isAuthenticated) {
    store.dispatch(logout());
    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    window.location.href = '/login';
  }
  return next(action);
};
```

---

## 2. Dashboard Data Management

### Fetch Tables

```typescript
export const fetchTables = createAsyncThunk(
  'dashboard/fetchTables',
  async () => {
    const response = await api.get('/tables');
    return response.data.tables;
  }
);
```

### Table Selection

```typescript
export const selectTable = (tableId: string) => ({
  type: 'dashboard/selectTable',
  payload: tableId
});

export const openSidePanel = () => ({
  type: 'dashboard/openSidePanel'
});

export const closeSidePanel = () => ({
  type: 'dashboard/closeSidePanel'
});
```

### New Order Notification

```typescript
export const markOrderAsNew = (orderId: string) => ({
  type: 'dashboard/markOrderAsNew',
  payload: orderId
});

export const clearNewOrderFlag = (orderId: string) => ({
  type: 'dashboard/clearNewOrderFlag',
  payload: orderId
});

// Auto-clear after 5 seconds
export const handleNewOrder = (order: Order) => (dispatch) => {
  dispatch(orderReceived(order));
  dispatch(markOrderAsNew(order.id));
  
  setTimeout(() => {
    dispatch(clearNewOrderFlag(order.id));
  }, 5000);
};
```

---

## 3. Order Management Logic

### Update Order Status

```typescript
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data.order;
  }
);

// Status transition logic
export const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
  const transitions: Record<OrderStatus, OrderStatus> = {
    pending: 'preparing',
    preparing: 'completed',
    completed: 'completed' // No next status
  };
  return transitions[currentStatus];
};

export const getNextStatusLabel = (currentStatus: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: '준비 시작',
    preparing: '완료 처리',
    completed: '완료됨'
  };
  return labels[currentStatus];
};
```

### Delete Order (2-step confirmation)

```typescript
export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (orderId: string) => {
    await api.delete(`/orders/${orderId}`);
    return orderId;
  }
);

// Component-level confirmation logic (see frontend-components.md)
```

### Complete Table Session

```typescript
export const completeSession = createAsyncThunk(
  'tables/completeSession',
  async (tableId: string) => {
    await api.post(`/tables/${tableId}/complete`);
    return tableId;
  }
);
```

---

## 4. SSE Event Handling

### SSE Event Dispatcher

```typescript
export const handleSSEEvent = (event: SSEEvent) => (dispatch, getState) => {
  switch (event.type) {
    case 'order:created':
      dispatch(handleNewOrder(event.data));
      playNotificationSound();
      break;
      
    case 'order:updated':
      dispatch(orderUpdated(event.data));
      break;
      
    case 'order:deleted':
      dispatch(orderDeleted(event.data.orderId, event.data.tableId));
      break;
  }
};
```

### SSE Reconnection Logic (Exponential Backoff)

```typescript
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // 30초

export const reconnectSSE = () => (dispatch) => {
  const delay = Math.min(1000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);
  
  dispatch(sseReconnecting(reconnectAttempts, delay));
  
  setTimeout(() => {
    reconnectAttempts++;
    // useSSE hook will handle actual reconnection
  }, delay);
};

export const resetReconnectAttempts = () => {
  reconnectAttempts = 0;
};
```

### Notification Sound

```typescript
let audioContext: AudioContext | null = null;

export const playNotificationSound = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800; // 800Hz
  gainNode.gain.value = 0.3;
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2); // 200ms
};
```

---

## 5. Menu Management Logic

### Fetch Menus and Categories

```typescript
export const fetchMenus = createAsyncThunk(
  'menuManagement/fetchMenus',
  async () => {
    const response = await api.get('/menus');
    return response.data.menus;
  }
);

export const fetchCategories = createAsyncThunk(
  'menuManagement/fetchCategories',
  async () => {
    const response = await api.get('/categories');
    return response.data.categories;
  }
);
```

### Create/Update/Delete Menu

```typescript
export const createMenu = createAsyncThunk(
  'menuManagement/createMenu',
  async (menuData: MenuFormData) => {
    const response = await api.post('/menus', menuData);
    return response.data.menu;
  }
);

export const updateMenu = createAsyncThunk(
  'menuManagement/updateMenu',
  async ({ id, data }: { id: string; data: MenuFormData }) => {
    const response = await api.put(`/menus/${id}`, data);
    return response.data.menu;
  }
);

export const deleteMenu = createAsyncThunk(
  'menuManagement/deleteMenu',
  async (menuId: string) => {
    await api.delete(`/menus/${menuId}`);
    return menuId;
  }
);
```

### Menu Display Order Management

```typescript
export const moveMenuUp = createAsyncThunk(
  'menuManagement/moveMenuUp',
  async (menuId: string, { getState }) => {
    const state = getState() as RootState;
    const menus = state.menuManagement.menus;
    const currentIndex = menus.findIndex(m => m.id === menuId);
    
    if (currentIndex <= 0) return; // Already at top
    
    const targetMenu = menus[currentIndex];
    const aboveMenu = menus[currentIndex - 1];
    
    // Swap display orders
    await api.patch(`/menus/${targetMenu.id}/order`, { 
      displayOrder: aboveMenu.displayOrder 
    });
    await api.patch(`/menus/${aboveMenu.id}/order`, { 
      displayOrder: targetMenu.displayOrder 
    });
    
    return { menuId, direction: 'up' };
  }
);

export const moveMenuDown = createAsyncThunk(
  'menuManagement/moveMenuDown',
  async (menuId: string, { getState }) => {
    const state = getState() as RootState;
    const menus = state.menuManagement.menus;
    const currentIndex = menus.findIndex(m => m.id === menuId);
    
    if (currentIndex >= menus.length - 1) return; // Already at bottom
    
    const targetMenu = menus[currentIndex];
    const belowMenu = menus[currentIndex + 1];
    
    // Swap display orders
    await api.patch(`/menus/${targetMenu.id}/order`, { 
      displayOrder: belowMenu.displayOrder 
    });
    await api.patch(`/menus/${belowMenu.id}/order`, { 
      displayOrder: targetMenu.displayOrder 
    });
    
    return { menuId, direction: 'down' };
  }
);
```

---

## 6. Historical Orders Logic

### Fetch Order History (Infinite Scroll)

```typescript
export const fetchOrderHistory = createAsyncThunk(
  'orderHistory/fetch',
  async ({ tableId, cursor }: { tableId: string; cursor?: string }) => {
    const params = cursor ? { cursor } : {};
    const response = await api.get(`/tables/${tableId}/history`, { params });
    return response.data;
  }
);

// Infinite scroll handler
export const loadMoreHistory = (tableId: string) => (dispatch, getState) => {
  const state = getState() as RootState;
  const { hasMore, nextCursor } = state.orderHistory;
  
  if (!hasMore) return;
  
  dispatch(fetchOrderHistory({ tableId, cursor: nextCursor }));
};
```

---

## 7. API Error Handling

### Retry Logic (User-triggered)

```typescript
export const retryApiCall = (action: any) => async (dispatch) => {
  try {
    await dispatch(action);
  } catch (error) {
    if (confirm('요청 실패. 다시 시도하시겠습니까?')) {
      await dispatch(action);
    }
  }
};
```

### Error Response Handler

```typescript
export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        break;
      case 403:
        alert('권한이 없습니다.');
        break;
      case 404:
        alert('요청한 리소스를 찾을 수 없습니다.');
        break;
      case 500:
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
      default:
        alert(data.message || '요청 처리 중 오류가 발생했습니다.');
    }
  } else if (error.request) {
    alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
  } else {
    alert('요청 처리 중 오류가 발생했습니다.');
  }
};
```

---

## 8. Data Transformation Logic

### Order Data Aggregation

```typescript
export const aggregateTableOrders = (orders: Order[]): {
  totalAmount: number;
  orderCount: number;
  lastOrderAt: string | null;
} => {
  const activeOrders = orders.filter(o => !o.deletedAt);
  
  return {
    totalAmount: activeOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    orderCount: activeOrders.length,
    lastOrderAt: activeOrders.length > 0 
      ? activeOrders[activeOrders.length - 1].createdAt 
      : null
  };
};
```

### Menu Sorting

```typescript
export const sortMenusByDisplayOrder = (menus: Menu[]): Menu[] => {
  return [...menus].sort((a, b) => a.displayOrder - b.displayOrder);
};

export const sortMenusByCategory = (menus: Menu[], categories: Category[]): Menu[] => {
  const categoryOrder = categories.reduce((acc, cat, idx) => {
    acc[cat.id] = idx;
    return acc;
  }, {} as Record<string, number>);
  
  return [...menus].sort((a, b) => {
    const catDiff = categoryOrder[a.categoryId] - categoryOrder[b.categoryId];
    if (catDiff !== 0) return catDiff;
    return a.displayOrder - b.displayOrder;
  });
};
```

---

## 9. Polling Strategy

### Dashboard Polling (5분마다)

```typescript
export const startDashboardPolling = () => (dispatch) => {
  // Initial fetch
  dispatch(fetchTables());
  
  // Poll every 5 minutes
  const intervalId = setInterval(() => {
    dispatch(fetchTables());
  }, 5 * 60 * 1000);
  
  return () => clearInterval(intervalId);
};
```

---

## 10. Form Validation Logic

### Login Form Validation

```typescript
export const validateLoginForm = (formData: {
  storeId: string;
  username: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!formData.storeId) {
    errors.push({ field: 'storeId', message: '매장 식별자를 입력해주세요' });
  }
  
  if (!formData.username) {
    errors.push({ field: 'username', message: '사용자명을 입력해주세요' });
  }
  
  if (!formData.password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요' });
  }
  
  return errors;
};
```

### Menu Form Validation

```typescript
export const validateMenuForm = (formData: MenuFormData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!formData.nameKo) {
    errors.push({ field: 'nameKo', message: '메뉴명(한글)을 입력해주세요' });
  }
  
  if (!formData.nameEn) {
    errors.push({ field: 'nameEn', message: '메뉴명(영문)을 입력해주세요' });
  }
  
  if (!formData.categoryId) {
    errors.push({ field: 'categoryId', message: '카테고리를 선택해주세요' });
  }
  
  if (formData.price <= 0) {
    errors.push({ field: 'price', message: '가격은 0보다 커야 합니다' });
  }
  
  if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
    errors.push({ field: 'imageUrl', message: '올바른 URL 형식이 아닙니다' });
  }
  
  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};
```

---

## Summary

**Key Business Logic Areas**:
1. Authentication & Session Management
2. Dashboard Data Aggregation
3. Order Status Transitions
4. SSE Event Handling & Reconnection
5. Menu CRUD & Display Order Management
6. Historical Orders (Infinite Scroll)
7. API Error Handling & Retry
8. Data Transformation & Sorting
9. Polling Strategy
10. Form Validation

**Technology Stack**:
- Redux Toolkit (state management)
- Redux Thunk (async actions)
- Custom hooks (useSSE)
- localStorage (session persistence)
- Web Audio API (notification sound)
- EventSource API (SSE)
