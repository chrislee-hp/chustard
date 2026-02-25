import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock fetch
const mockMenus = {
  categories: [{
    id: 'c1', name: 'Main', sortOrder: 0,
    menus: [{ id: 'm1', nameKo: '김치찌개', nameEn: 'Kimchi Stew', descKo: '', descEn: '', price: 9000, imageUrl: '', sortOrder: 0 }]
  }]
};

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/auth/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ valid: true, role: 'table' }) });
    if (url.includes('/api/menus')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMenus) });
    if (url.includes('/api/orders') && !url.includes('admin')) return Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ order: { id: 'o1', totalAmount: 9000, items: [] } }) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('Pages', () => {
  test('로그인 안 된 상태 → 로그인 페이지 표시', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /로그인|Login/ })).toBeInTheDocument();
  });

  test('로그인 된 상태 → 메뉴 페이지 표시', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'store1');
    render(<MemoryRouter initialEntries={['/menu']}><App /></MemoryRouter>);
    
    // Wait for AuthGuard verification
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(await screen.findByText('김치찌개')).toBeInTheDocument();
  });

  test('메뉴 카드 클릭 → 장바구니에 추가', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'store1');
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/menu']}><App /></MemoryRouter>);
    
    // Wait for AuthGuard verification
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const card = await screen.findByText('김치찌개');
    await user.click(card);
    expect(await screen.findByRole('heading', { name: /장바구니|Cart/ })).toBeInTheDocument();
  });

  test('네트워크 에러 처리', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'store1');
    
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/auth/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ valid: true }) });
      if (url.includes('/api/menus')) return Promise.resolve({ ok: false, status: 500 });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    
    render(<MemoryRouter initialEntries={['/menu']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(await screen.findByText(/메뉴를 불러올 수 없습니다/)).toBeInTheDocument();
  });

  test('언어 토글 → 영어 전환', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'store1');
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/menu']}><App /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    await screen.findByText('김치찌개');
    const toggle = screen.getByRole('button', { name: /Switch to English|한국어로 변경/ });
    await user.click(toggle);
    expect(await screen.findByText('Kimchi Stew')).toBeInTheDocument();
  });
});
