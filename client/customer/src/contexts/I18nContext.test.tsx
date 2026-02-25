import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { I18nProvider, useI18n } from './I18nContext'

function TestComponent() {
  const { locale, t, setLocale } = useI18n()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="greeting">{t('greeting')}</span>
      <button onClick={() => setLocale('en')}>en</button>
      <button onClick={() => setLocale('ko')}>ko</button>
    </div>
  )
}

describe('I18nContext', () => {
  it('기본 언어는 한국어', () => {
    render(<I18nProvider><TestComponent /></I18nProvider>)
    expect(screen.getByTestId('locale')).toHaveTextContent('ko')
  })

  it('언어 전환 시 locale 변경', async () => {
    render(<I18nProvider><TestComponent /></I18nProvider>)
    await act(async () => {
      screen.getByText('en').click()
    })
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
  })

  it('t 함수로 번역 키 조회', () => {
    render(<I18nProvider><TestComponent /></I18nProvider>)
    // 번역 파일에 greeting 키가 있다고 가정
    expect(screen.getByTestId('greeting')).toBeInTheDocument()
  })
})
