import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn((url, opts) => {
    if (url.includes('/api/admin/login')) {
      if (opts?.body?.includes('wrong')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: { code: 'UNAUTHORIZED' } }) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'admin-token', expiresIn: 57600 }) });
    }
    if (url.includes('/api/admin/orders') && !url.includes('status') && !url.includes('history') && opts?.method !== 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ tables: [
        { tableId: 't1', tableNumber: 1, status: 'active', orders: [{ id: 'o1', status: 'pending', totalAmount: 9000, items: [{ id: 'i1', nameKo: '김치찌개', quantity: 1, price: 9000 }] }], totalAmount: 9000 }
      ] }) });
    }
    if (url.includes('/api/admin/tables') && !url.includes('complete')) {
      return Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ tables: [{ id: 't1', tableNumber: 1, status: 'inactive' }] }) });
    }
    if (url.includes('/api/admin/menus') || (url.includes('/api/menus') && !url.includes('/api/admin'))) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [{ id: 'c1', name: 'Main', menus: [{ id: 'm1', nameKo: '김치찌개', nameEn: 'Kimchi', price: 9000, isAvailable: true }] }] }) });
    }
    if (url.includes('history')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ orders: [] }) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('Admin Pages', () => {
  test('로그인 안 된 상태 → 로그인 페이지', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '관리자 로그인' })).toBeInTheDocument();
  });

  test('로그인 성공 → 대시보드 이동', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
    
    // Use labelText instead of placeholder
    await user.type(screen.getByLabelText('Store ID'), 'store1');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(await screen.findByRole('heading', { name: '주문 대시보드' })).toBeInTheDocument();
  });

  test('대시보드 - 테이블 카드 표시', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(await screen.findByText(/테이블 1/)).toBeInTheDocument();
    expect(await screen.findByText('대기중')).toBeInTheDocument();
  });

  test('대시보드 - 주문 클릭 → 상세 표시', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const order = await screen.findByText('대기중');
    await user.click(order);
    expect(await screen.findByTestId('order-detail')).toBeInTheDocument();
  });

  test('테이블 관리 페이지', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/tables']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(await screen.findByRole('heading', { name: '테이블 관리' })).toBeInTheDocument();
  });

  test('메뉴 관리 페이지', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/menus']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(await screen.findByRole('heading', { name: '메뉴 관리' })).toBeInTheDocument();
  });

  test('주문 내역 페이지', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/history']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(await screen.findByRole('heading', { name: '주문 내역' })).toBeInTheDocument();
  });

  test('로그인 실패 → 에러 메시지 표시', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
    await user.type(screen.getByLabelText('Store ID'), 'store1');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByText('인증 실패')).toBeInTheDocument();
  });

  test('대시보드 - 주문 상태 변경 버튼', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    const order = await screen.findByText('대기중');
    await user.click(order);
    const btn = await screen.findByText('준비 시작');
    expect(btn).toBeInTheDocument();
  });

  test('대시보드 - 삭제 버튼 표시', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    const order = await screen.findByText('대기중');
    await user.click(order);
    expect(await screen.findByText('삭제')).toBeInTheDocument();
  });

  test('대시보드 - 이용 완료 버튼 표시', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(await screen.findByText('이용 완료')).toBeInTheDocument();
  });

  test('테이블 관리 - 테이블 목록 표시', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/tables']}><App /></MemoryRouter>);
    expect(await screen.findByText(/테이블 1/)).toBeInTheDocument();
  });

  test('메뉴 관리 - 메뉴 항목 표시', async () => {
    localStorage.setItem('adminToken', 'test');
    localStorage.setItem('adminStoreId', 's1');
    render(<MemoryRouter initialEntries={['/menus']}><App /></MemoryRouter>);
    expect(await screen.findByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });
});
