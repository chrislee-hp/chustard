import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import OrderConfirmPage from '../pages/OrderConfirmPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import SessionExpiredPage from '../pages/SessionExpiredPage';

vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    lang: 'ko', t: (k) => ({ confirmOrder: '주문 확인', total: '합계', won: '원', back: '뒤로', confirm: '확인', orderSuccess: '주문 완료', redirecting: '초 후 메뉴로 이동', orderHistory: '주문 내역', noOrders: '주문 내역이 없습니다.', sessionExpired: '세션 만료', sessionExpiredMsg: '세션이 만료되었습니다.', orderFailed: '주문 실패' }[k] || k)
  })
}));
vi.mock('../hooks/useSSE', () => ({ useSSE: vi.fn() }));
vi.mock('../hooks/useCart', () => ({
  useCart: () => {
    const raw = localStorage.getItem('cart');
    const items = raw ? JSON.parse(raw) : [];
    return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0), clear: vi.fn(), addItem: vi.fn(), updateQty: vi.fn(), removeItem: vi.fn() };
  }
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'tk');
  localStorage.setItem('tableId', 't1');
  localStorage.setItem('sessionId', 's1');
  localStorage.setItem('storeId', 'st1');
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
});

describe('OrderConfirmPage', () => {
  test('장바구니 항목 표시', () => {
    localStorage.setItem('cart', JSON.stringify([{ menuId: 'm1', nameKo: '김치찌개', nameEn: 'Kimchi', price: 9000, quantity: 2 }]));
    render(<MemoryRouter><OrderConfirmPage /></MemoryRouter>);
    expect(screen.getByText('주문 확인')).toBeInTheDocument();
    expect(screen.getByText(/김치찌개 x 2/)).toBeInTheDocument();
  });

  test('주문 확인 → API 호출', async () => {
    localStorage.setItem('cart', JSON.stringify([{ menuId: 'm1', nameKo: '김치찌개', nameEn: 'Kimchi', price: 9000, quantity: 1 }]));
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ order: { id: 'o1' } }) }));
    const user = userEvent.setup();
    render(<MemoryRouter><OrderConfirmPage /></MemoryRouter>);
    await user.click(screen.getByText('확인'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/orders'), expect.objectContaining({ method: 'POST' }));
  });
});

describe('OrderSuccessPage', () => {
  test('주문 완료 메시지 표시', () => {
    render(<MemoryRouter><OrderSuccessPage /></MemoryRouter>);
    expect(screen.getByText(/주문 완료/)).toBeInTheDocument();
  });
});

describe('OrderHistoryPage', () => {
  test('주문 내역 없으면 빈 메시지', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ orders: [] }) }));
    render(<MemoryRouter><OrderHistoryPage /></MemoryRouter>);
    expect(await screen.findByText('주문 내역이 없습니다.')).toBeInTheDocument();
  });

  test('주문 내역 표시', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ orders: [{ id: 'o1', status: 'pending', totalAmount: 9000, createdAt: '2026-01-01', items: [{ id: 'i1', nameKo: '김치찌개', nameEn: 'Kimchi', price: 9000, quantity: 1 }] }] }) }));
    render(<MemoryRouter><OrderHistoryPage /></MemoryRouter>);
    expect(await screen.findByText(/김치찌개/)).toBeInTheDocument();
  });
});

describe('SessionExpiredPage', () => {
  test('세션 만료 메시지 표시', () => {
    render(<MemoryRouter><SessionExpiredPage /></MemoryRouter>);
    expect(screen.getByText('세션 만료')).toBeInTheDocument();
  });
});
