import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CartItem } from './CartItem'
import { I18nProvider } from '../contexts'

const mockItem = {
  menuId: 'm1',
  nameKo: '김치찌개',
  nameEn: 'Kimchi Stew',
  price: 8000,
  quantity: 2,
}

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('CartItem', () => {
  it('아이템 정보 렌더링', () => {
    renderWithI18n(<CartItem item={mockItem} onIncrease={() => {}} onDecrease={() => {}} />)
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('₩16,000')).toBeInTheDocument()
  })

  it('+ 버튼 클릭 시 onIncrease 호출', () => {
    const onIncrease = vi.fn()
    renderWithI18n(<CartItem item={mockItem} onIncrease={onIncrease} onDecrease={() => {}} />)
    screen.getByText('+').click()
    expect(onIncrease).toHaveBeenCalled()
  })

  it('- 버튼 클릭 시 onDecrease 호출', () => {
    const onDecrease = vi.fn()
    renderWithI18n(<CartItem item={mockItem} onIncrease={() => {}} onDecrease={onDecrease} />)
    screen.getByText('-').click()
    expect(onDecrease).toHaveBeenCalled()
  })
})
