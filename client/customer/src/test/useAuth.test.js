import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

describe('useAuth', () => {
  test('초기 상태 - localStorage 비어있으면 null', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.auth).toBeNull();
  });

  test('초기 상태 - localStorage에 토큰 있으면 복원', () => {
    localStorage.setItem('token', 'tk');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'st1');
    const { result } = renderHook(() => useAuth());
    expect(result.current.auth).toEqual({ token: 'tk', tableId: 't1', sessionId: 's1', storeId: 'st1' });
  });

  test('login 성공 → localStorage 저장 + auth 업데이트', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'new-tk', tableId: 't1', sessionId: 's1' }) }));
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.login('store1', 1, '1234'); });
    expect(localStorage.getItem('token')).toBe('new-tk');
    expect(result.current.auth.token).toBe('new-tk');
  });

  test('login 실패 → 에러 throw', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'fail' }) }));
    const { result } = renderHook(() => useAuth());
    await expect(act(async () => { await result.current.login('store1', 1, 'wrong'); })).rejects.toThrow();
  });

  test('logout → localStorage 클리어 + auth null', () => {
    localStorage.setItem('token', 'tk');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'st1');
    const { result } = renderHook(() => useAuth());
    act(() => { result.current.logout(); });
    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.auth).toBeNull();
  });

  test('verify - 유효한 토큰 → true', async () => {
    localStorage.setItem('token', 'tk');
    localStorage.setItem('tableId', 't1');
    localStorage.setItem('sessionId', 's1');
    localStorage.setItem('storeId', 'st1');
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
    const { result } = renderHook(() => useAuth());
    let valid;
    await act(async () => { valid = await result.current.verify(); });
    expect(valid).toBe(true);
  });

  test('verify - 토큰 없으면 false', async () => {
    const { result } = renderHook(() => useAuth());
    let valid;
    await act(async () => { valid = await result.current.verify(); });
    expect(valid).toBe(false);
  });
});
