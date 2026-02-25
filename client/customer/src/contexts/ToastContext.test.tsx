import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastContext'

function TestComponent() {
  const { toasts, showToast, removeToast } = useToast()
  return (
    <div>
      <span data-testid="count">{toasts.length}</span>
      <button onClick={() => showToast('성공!', 'success')}>success</button>
      <button onClick={() => showToast('에러!', 'error')}>error</button>
      {toasts.map(t => (
        <div key={t.id} data-testid="toast">
          {t.message}
          <button onClick={() => removeToast(t.id)}>x</button>
        </div>
      ))}
    </div>
  )
}

describe('ToastContext', () => {
  it('초기 상태는 빈 토스트 목록', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('showToast 호출 시 토스트 추가', async () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    await act(async () => {
      screen.getByText('success').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('toast')).toHaveTextContent('성공!')
  })

  it('removeToast 호출 시 토스트 제거', async () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    await act(async () => {
      screen.getByText('success').click()
    })
    await act(async () => {
      screen.getByText('x').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('3초 후 자동 제거', async () => {
    vi.useFakeTimers()
    render(<ToastProvider><TestComponent /></ToastProvider>)
    await act(async () => {
      screen.getByText('success').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    vi.useRealTimers()
  })
})
