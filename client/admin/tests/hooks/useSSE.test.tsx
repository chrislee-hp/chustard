import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import { useSSE } from '../../src/hooks/useSSE';

describe('useSSE', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not create EventSource without token', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useSSE(), { wrapper });

    // Hook should return without error
    expect(result.current).toBeUndefined();
  });

  it('should create EventSource with valid token', () => {
    localStorage.setItem('admin_token', 'valid-token');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    // Mock EventSource
    global.EventSource = jest.fn().mockImplementation(() => ({
      addEventListener: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onerror: null
    })) as any;

    const { result } = renderHook(() => useSSE(), { wrapper });

    expect(global.EventSource).toHaveBeenCalledWith('/api/sse?token=valid-token');
  });
});
