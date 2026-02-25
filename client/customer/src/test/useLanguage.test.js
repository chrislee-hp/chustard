import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '../hooks/useLanguage';

beforeEach(() => localStorage.clear());

describe('useLanguage', () => {
  test('기본 언어 ko', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe('ko');
  });

  test('t() - 한국어 번역', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.t('menu')).toBe('메뉴');
  });

  test('toggle - ko→en 전환', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggle());
    expect(result.current.lang).toBe('en');
    expect(result.current.t('menu')).toBe('Menu');
  });

  test('localStorage 저장', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggle());
    expect(localStorage.getItem('lang')).toBe('en');
  });
});
