import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

function TestComponent() {
  const { isAuthenticated, token, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <button onClick={() => login('test-token', 'table-1', 'session-1', 'store-1')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('초기 상태는 미인증', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('auth')).toHaveTextContent('no')
    expect(screen.getByTestId('token')).toHaveTextContent('none')
  })

  it('login 호출 시 인증 상태로 변경', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await act(async () => {
      screen.getByText('login').click()
    })
    expect(screen.getByTestId('auth')).toHaveTextContent('yes')
    expect(screen.getByTestId('token')).toHaveTextContent('test-token')
  })

  it('logout 호출 시 미인증 상태로 변경', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await act(async () => {
      screen.getByText('login').click()
    })
    await act(async () => {
      screen.getByText('logout').click()
    })
    expect(screen.getByTestId('auth')).toHaveTextContent('no')
  })
})
