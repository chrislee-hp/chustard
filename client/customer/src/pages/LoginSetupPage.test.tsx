import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginSetupPage } from './LoginSetupPage'
import { AuthProvider, I18nProvider, ToastProvider } from '../contexts'
import { BrowserRouter } from 'react-router-dom'

function renderPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <ToastProvider>
            <LoginSetupPage />
          </ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginSetupPage', () => {
  it('로그인 폼 렌더링', () => {
    renderPage()
    expect(screen.getByLabelText(/매장 ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/테이블 번호/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument()
  })

  it('필수 필드 미입력 시 버튼 disabled', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /로그인/i })).toBeDisabled()
  })

  it('모든 필드 입력 시 버튼 enabled', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText(/매장 ID/i), { target: { value: 'store1' } })
    fireEvent.change(screen.getByLabelText(/테이블 번호/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/비밀번호/i), { target: { value: 'pass' } })
    expect(screen.getByRole('button', { name: /로그인/i })).not.toBeDisabled()
  })
})
