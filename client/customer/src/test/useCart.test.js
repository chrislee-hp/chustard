import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';

beforeEach(() => localStorage.clear());

describe('useCart', () => {
  const menu = { id: 'm1', nameKo: '김치찌개', nameEn: 'Kimchi', price: 9000 };

  test('addItem - 새 메뉴 추가', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(menu));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
  });

  test('addItem - 동일 메뉴 수량 증가', () => {
    const { result } = renderHook(() => useCart());
    act(() => { result.current.addItem(menu); result.current.addItem(menu); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  test('updateQty - 수량 0이면 자동 제거', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(menu));
    act(() => result.current.updateQty('m1', 0));
    expect(result.current.items).toHaveLength(0);
  });

  test('total 계산', () => {
    const { result } = renderHook(() => useCart());
    act(() => { result.current.addItem(menu); result.current.addItem(menu); });
    expect(result.current.total).toBe(18000);
  });

  test('clear - 장바구니 비우기', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(menu));
    act(() => result.current.clear());
    expect(result.current.items).toHaveLength(0);
  });

  test('localStorage 동기화', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(menu));
    expect(JSON.parse(localStorage.getItem('cart'))).toHaveLength(1);
  });
});
