import { renderHook, act } from '@testing-library/react';
import { useAdminAuth } from '../hooks/useAdminAuth';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

describe('useAdminAuth', () => {
  test('초기 상태 - localStorage 비어있으면 null', () => {
    const { result } = renderHook(() => useAdminAuth());
    expect(result.current.auth).toBeNull();
  });

  test('초기 상태 - localStorage에 토큰 있으면 복원', () => {
    localStorage.setItem('adminToken', 'tk');
    localStorage.setItem('adminStoreId', 'st1');
    const { result } = renderHook(() => useAdminAuth());
    expect(result.current.auth).toEqual({ token: 'tk', storeId: 'st1' });
  });

  test('login 성공 → localStorage 저장 + auth 업데이트', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'new-tk', expiresIn: 57600 }) }));
    const { result } = renderHook(() => useAdminAuth());
    await act(async () => { await result.current.login('store1', 'admin', 'pass'); });
    expect(localStorage.getItem('adminToken')).toBe('new-tk');
    expect(localStorage.getItem('adminStoreId')).toBe('store1');
    expect(result.current.auth.token).toBe('new-tk');
  });

  test('login 실패 → 에러 throw', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: { code: 'UNAUTHORIZED' } }) }));
    const { result } = renderHook(() => useAdminAuth());
    await expect(act(async () => { await result.current.login('s', 'a', 'wrong'); })).rejects.toThrow();
  });

  test('logout → localStorage 클리어 + auth null', () => {
    localStorage.setItem('adminToken', 'tk');
    localStorage.setItem('adminStoreId', 'st1');
    const { result } = renderHook(() => useAdminAuth());
    act(() => { result.current.logout(); });
    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(result.current.auth).toBeNull();
  });

  test('fetchAuth - 토큰 없으면 에러', async () => {
    const { result } = renderHook(() => useAdminAuth());
    await expect(act(async () => { await result.current.fetchAuth('/api/test'); })).rejects.toThrow();
  });

  test('fetchAuth - 토큰 있으면 Authorization 헤더 포함', async () => {
    localStorage.setItem('adminToken', 'tk');
    localStorage.setItem('adminStoreId', 'st1');
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    const { result } = renderHook(() => useAdminAuth());
    await act(async () => { await result.current.fetchAuth('/api/test'); });
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer tk' }) }));
  });
});
