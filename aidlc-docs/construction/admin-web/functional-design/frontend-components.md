# Frontend Components - admin-web

## Component Hierarchy

```
App
├── AuthProvider (Redux Provider + SSE Context)
├── Router
    ├── LoginPage
    └── AdminLayout
        ├── Header
        │   ├── TabNavigation (주문 모니터링 / 메뉴 관리)
        │   └── UserMenu (로그아웃)
        └── MainContent
            ├── [Tab 1] OrderMonitoringTab
            │   ├── DashboardGrid
            │   │   └── TableCard[] (전체 주문 스크롤)
            │   └── OrderDetailSidePanel (slide-in overlay)
            │       ├── OrderList
            │       ├── OrderStatusButtons
            │       ├── DeleteOrderButton
            │       ├── CompleteSessionButton
            │       └── ViewHistoryButton
            │
            └── [Tab 2] MenuManagementTab
                ├── MenuListView
                │   ├── CategoryFilter
                │   ├── MenuTable
                │   └── CreateMenuButton
                ├── MenuCreatePage (별도 페이지)
                │   └── MenuForm
                └── MenuEditPage (별도 페이지)
                    └── MenuForm
```

---

## Component Specifications

### 1. App Component

**Props**: None

**State**: None (Redux Provider 래핑)

**Responsibilities**:
- Redux store provider
- SSE connection initialization (useSSE hook)
- Router setup

```typescript
const App = () => {
  useSSE(); // SSE 연결 시작
  
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="orders" />} />
            <Route path="orders" element={<OrderMonitoringTab />} />
            <Route path="menus" element={<MenuManagementTab />} />
            <Route path="menus/create" element={<MenuCreatePage />} />
            <Route path="menus/:id/edit" element={<MenuEditPage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};
```

---

### 2. LoginPage

**Props**: None

**State**: 
- `formData: { storeId, username, password }`
- `isLoading: boolean`

**Redux Actions**:
- `loginRequest(credentials)`
- `loginSuccess(user, token)`
- `loginFailure(error)`

**Validation**:
- 필수 필드 체크 (submit 시점)
- 5회 실패 시 5분 차단 (서버 응답 기반)

**API Integration**:
- `POST /api/auth/login`
- 성공 시 token을 localStorage 저장
- 실패 시 Alert dialog 표시

```typescript
interface LoginPageProps {}

const LoginPage = () => {
  const [formData, setFormData] = useState({ storeId: '', username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeId || !formData.username || !formData.password) {
      alert('모든 필드를 입력해주세요');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      dispatch(loginSuccess(response.data.user, response.data.token));
      localStorage.setItem('admin_token', response.data.token);
      navigate('/admin/orders');
    } catch (error) {
      alert(error.response?.data?.message || '로그인 실패');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="storeId" value={formData.storeId} onChange={handleChange} />
      <input name="username" value={formData.username} onChange={handleChange} />
      <input type="password" name="password" value={formData.password} onChange={handleChange} />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};
```

---

### 3. AdminLayout

**Props**: None

**Responsibilities**:
- 전체 레이아웃 구조
- 세션 만료 체크 (16시간)
- 인증 가드

```typescript
const AdminLayout = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    }
  }, [isAuthenticated]);
  
  return (
    <div className="admin-layout">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
```

---

### 4. Header

**Props**: None

**State**: None

**Responsibilities**:
- 탭 네비게이션 (주문 모니터링 / 메뉴 관리)
- 로그아웃 버튼

```typescript
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('admin_token');
    navigate('/login');
  };
  
  return (
    <header>
      <nav>
        <NavLink to="/admin/orders">주문 모니터링</NavLink>
        <NavLink to="/admin/menus">메뉴 관리</NavLink>
      </nav>
      <button onClick={handleLogout}>로그아웃</button>
    </header>
  );
};
```

---

### 5. OrderMonitoringTab

**Props**: None

**Redux State**:
- `tables: Table[]`
- `selectedTableId: string | null`
- `sidePanelOpen: boolean`

**Responsibilities**:
- 테이블 카드 그리드 표시
- 사이드 패널 제어
- SSE 데이터 실시간 반영
- 5분마다 polling (SSE 보조)

```typescript
const OrderMonitoringTab = () => {
  const tables = useSelector(state => state.dashboard.tables);
  const sidePanelOpen = useSelector(state => state.dashboard.sidePanelOpen);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchTables());
    const interval = setInterval(() => dispatch(fetchTables()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);
  
  return (
    <div className="order-monitoring">
      <DashboardGrid tables={tables} />
      {sidePanelOpen && <OrderDetailSidePanel />}
    </div>
  );
};
```

---

### 6. DashboardGrid

**Props**:
- `tables: Table[]`

**Responsibilities**:
- Grid layout (4열, 반응형)
- 테이블 카드 렌더링
- 신규 주문 시각적 강조 + 소리 알림

```typescript
interface DashboardGridProps {
  tables: Table[];
}

const DashboardGrid = ({ tables }: DashboardGridProps) => {
  const dispatch = useDispatch();
  const newOrderIds = useSelector(state => state.dashboard.newOrderIds);
  
  const handleCardClick = (tableId: string) => {
    dispatch(selectTable(tableId));
    dispatch(openSidePanel());
  };
  
  return (
    <div className="dashboard-grid">
      {tables.map(table => (
        <TableCard 
          key={table.id} 
          table={table} 
          isNew={newOrderIds.has(table.id)}
          onClick={() => handleCardClick(table.id)}
        />
      ))}
    </div>
  );
};
```

---

### 7. TableCard

**Props**:
- `table: Table`
- `isNew: boolean`
- `onClick: () => void`

**Responsibilities**:
- 테이블 정보 표시 (번호, 총 주문액, 주문 수)
- 전체 주문 목록 표시 (스크롤)
- 신규 주문 강조 (애니메이션)
- 활성/비활성 시각적 구분

```typescript
interface TableCardProps {
  table: Table;
  isNew: boolean;
  onClick: () => void;
}

const TableCard = ({ table, isNew, onClick }: TableCardProps) => {
  return (
    <div 
      className={`table-card ${isNew ? 'new-order' : ''} ${table.isActive ? 'active' : 'inactive'}`}
      onClick={onClick}
    >
      <h3>테이블 {table.tableNumber}</h3>
      <p>총 주문액: ₩{table.totalAmount.toLocaleString()}</p>
      <p>주문 수: {table.orderCount}</p>
      
      <div className="order-preview">
        {table.orders.map(order => (
          <div key={order.id} className="order-item">
            <span>{order.orderNumber}</span>
            <span>{order.status}</span>
            <span>₩{order.totalAmount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### 8. OrderDetailSidePanel

**Props**: None

**Redux State**:
- `selectedTableId: string`
- `tables: Table[]`

**Responsibilities**:
- Slide-in overlay 애니메이션
- 선택된 테이블의 전체 주문 표시
- 주문 상태 변경 버튼
- 주문 삭제 버튼
- 테이블 이용 완료 버튼
- 과거 내역 보기 버튼

```typescript
const OrderDetailSidePanel = () => {
  const selectedTableId = useSelector(state => state.dashboard.selectedTableId);
  const table = useSelector(state => 
    state.dashboard.tables.find(t => t.id === selectedTableId)
  );
  const dispatch = useDispatch();
  
  const handleClose = () => dispatch(closeSidePanel());
  
  if (!table) return null;
  
  return (
    <div className="side-panel-overlay" onClick={handleClose}>
      <div className="side-panel" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose}>닫기</button>
        <h2>테이블 {table.tableNumber}</h2>
        
        <OrderList orders={table.orders} />
        
        <div className="actions">
          <button onClick={() => dispatch(viewHistory(table.id))}>
            과거 내역 보기
          </button>
          <button onClick={() => dispatch(completeSession(table.id))}>
            이용 완료
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 9. OrderList

**Props**:
- `orders: Order[]`

**Responsibilities**:
- 주문 목록 표시
- 주문 상태 변경 버튼 (완료 시에만 확인)
- 주문 삭제 버튼 (2단계 확인)

```typescript
interface OrderListProps {
  orders: Order[];
}

const OrderList = ({ orders }: OrderListProps) => {
  const dispatch = useDispatch();
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  
  const handleStatusChange = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    
    if (nextStatus === 'completed') {
      if (confirm('주문을 완료 처리하시겠습니까?')) {
        dispatch(updateOrderStatus(order.id, nextStatus));
      }
    } else {
      dispatch(updateOrderStatus(order.id, nextStatus));
    }
  };
  
  const handleDelete = (orderId: string) => {
    if (confirmStep === 1) {
      if (confirm('삭제하시겠습니까?')) {
        setDeletingOrderId(orderId);
        setConfirmStep(2);
      }
    } else if (confirmStep === 2) {
      if (confirm('정말 삭제하시겠습니까?')) {
        dispatch(deleteOrder(orderId));
        setDeletingOrderId(null);
        setConfirmStep(1);
      }
    }
  };
  
  return (
    <div className="order-list">
      {orders.map(order => (
        <div key={order.id} className="order">
          <h4>{order.orderNumber}</h4>
          <p>상태: {order.status}</p>
          <ul>
            {order.items.map(item => (
              <li key={item.menuId}>
                {item.menuName} x {item.quantity} = ₩{item.subtotal.toLocaleString()}
              </li>
            ))}
          </ul>
          <p>총액: ₩{order.totalAmount.toLocaleString()}</p>
          
          <button onClick={() => handleStatusChange(order)}>
            {getNextStatusLabel(order.status)}
          </button>
          <button onClick={() => handleDelete(order.id)}>삭제</button>
        </div>
      ))}
    </div>
  );
};
```

---

### 10. MenuManagementTab

**Props**: None

**Responsibilities**:
- 메뉴 목록 표시
- 메뉴 생성/수정 페이지 라우팅

```typescript
const MenuManagementTab = () => {
  return (
    <Routes>
      <Route index element={<MenuListView />} />
      <Route path="create" element={<MenuCreatePage />} />
      <Route path=":id/edit" element={<MenuEditPage />} />
    </Routes>
  );
};
```

---

### 11. MenuListView

**Props**: None

**Redux State**:
- `menus: Menu[]`
- `categories: Category[]`

**Responsibilities**:
- 카테고리별 필터링
- 메뉴 테이블 표시
- 메뉴 생성 버튼
- 메뉴 수정/삭제 버튼
- 노출 순서 조정 (Up/Down 버튼)

```typescript
const MenuListView = () => {
  const menus = useSelector(state => state.menuManagement.menus);
  const categories = useSelector(state => state.menuManagement.categories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    dispatch(fetchMenus());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const filteredMenus = selectedCategoryId
    ? menus.filter(m => m.categoryId === selectedCategoryId)
    : menus;
  
  const handleMoveUp = (menuId: string) => {
    dispatch(moveMenuUp(menuId));
  };
  
  const handleMoveDown = (menuId: string) => {
    dispatch(moveMenuDown(menuId));
  };
  
  const handleDelete = (menuId: string) => {
    if (confirm('메뉴를 삭제하시겠습니까?')) {
      dispatch(deleteMenu(menuId));
    }
  };
  
  return (
    <div className="menu-list-view">
      <div className="filters">
        <select value={selectedCategoryId || ''} onChange={e => setSelectedCategoryId(e.target.value || null)}>
          <option value="">전체 카테고리</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nameKo}</option>
          ))}
        </select>
        <button onClick={() => navigate('/admin/menus/create')}>메뉴 추가</button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>순서</th>
            <th>메뉴명 (한)</th>
            <th>메뉴명 (영)</th>
            <th>가격</th>
            <th>카테고리</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {filteredMenus.map(menu => (
            <tr key={menu.id}>
              <td>
                <button onClick={() => handleMoveUp(menu.id)}>↑</button>
                <button onClick={() => handleMoveDown(menu.id)}>↓</button>
              </td>
              <td>{menu.nameKo}</td>
              <td>{menu.nameEn}</td>
              <td>₩{menu.price.toLocaleString()}</td>
              <td>{categories.find(c => c.id === menu.categoryId)?.nameKo}</td>
              <td>
                <button onClick={() => navigate(`/admin/menus/${menu.id}/edit`)}>수정</button>
                <button onClick={() => handleDelete(menu.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### 12. MenuCreatePage / MenuEditPage

**Props**: None (URL params for edit)

**State**:
- `formData: MenuFormData`
- `isLoading: boolean`

**Validation**:
- Submit 시점에만 검증
- 필수 필드, URL 형식 검증

```typescript
const MenuCreatePage = () => {
  const [formData, setFormData] = useState<MenuFormData>({
    nameKo: '', nameEn: '', descriptionKo: '', descriptionEn: '',
    price: 0, categoryId: '', imageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nameKo || !formData.nameEn || !formData.categoryId) {
      alert('필수 필드를 입력해주세요');
      return;
    }
    
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      alert('올바른 URL 형식이 아닙니다');
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(createMenu(formData));
      navigate('/admin/menus');
    } catch (error) {
      alert('메뉴 생성 실패: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="menu-form-page">
      <h2>메뉴 추가</h2>
      <form onSubmit={handleSubmit}>
        <input name="nameKo" placeholder="메뉴명 (한)" value={formData.nameKo} onChange={handleChange} />
        <input name="nameEn" placeholder="메뉴명 (영)" value={formData.nameEn} onChange={handleChange} />
        <textarea name="descriptionKo" placeholder="설명 (한)" value={formData.descriptionKo} onChange={handleChange} />
        <textarea name="descriptionEn" placeholder="설명 (영)" value={formData.descriptionEn} onChange={handleChange} />
        <input type="number" name="price" placeholder="가격" value={formData.price} onChange={handleChange} />
        <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
          <option value="">카테고리 선택</option>
          {/* categories */}
        </select>
        <input name="imageUrl" placeholder="이미지 URL" value={formData.imageUrl} onChange={handleChange} />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </button>
        <button type="button" onClick={() => navigate('/admin/menus')}>취소</button>
      </form>
    </div>
  );
};
```

---

## Custom Hooks

### useSSE

**Purpose**: SSE 연결 관리 및 Redux dispatch

```typescript
const useSSE = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    const eventSource = new EventSource(`/api/sse?token=${token}`);
    
    eventSource.onopen = () => {
      dispatch(sseConnected());
    };
    
    eventSource.addEventListener('order:created', (e) => {
      const order = JSON.parse(e.data);
      dispatch(orderReceived(order));
      playNotificationSound();
    });
    
    eventSource.addEventListener('order:updated', (e) => {
      const order = JSON.parse(e.data);
      dispatch(orderUpdated(order));
    });
    
    eventSource.addEventListener('order:deleted', (e) => {
      const { orderId, tableId } = JSON.parse(e.data);
      dispatch(orderDeleted(orderId, tableId));
    });
    
    eventSource.onerror = () => {
      dispatch(sseDisconnected());
      // Exponential backoff 재연결
      setTimeout(() => {
        dispatch(sseReconnecting());
      }, Math.min(1000 * 2 ** reconnectAttempts, 30000));
    };
    
    return () => eventSource.close();
  }, [dispatch]);
};
```

---

## Component Summary

**Total Components**: 12 main components + 1 custom hook

**Key Patterns**:
- Redux Toolkit for state management
- Custom hook (useSSE) for SSE encapsulation
- localStorage for session persistence
- Exponential backoff for SSE reconnection
- Component-level loading states
- Alert dialog for errors
- 2-step confirmation for critical actions
