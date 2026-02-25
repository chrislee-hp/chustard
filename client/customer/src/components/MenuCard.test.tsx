import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MenuCard } from './MenuCard'
import { I18nProvider } from '../contexts'

const mockMenu = {
  id: 'm1',
  nameKo: '김치찌개',
  nameEn: 'Kimchi Stew',
  descKo: '매콤한 김치찌개',
  descEn: 'Spicy kimchi stew',
  price: 8000,
  imageUrl: '/img/kimchi.jpg',
  categoryId: 'c1',
}

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('MenuCard', () => {
  it('메뉴 정보 렌더링 (한국어)', () => {
    renderWithI18n(<MenuCard menu={mockMenu} onAdd={() => {}} />)
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('₩8,000')).toBeInTheDocument()
  })

  it('추가 버튼 클릭 시 onAdd 호출', () => {
    const onAdd = vi.fn()
    renderWithI18n(<MenuCard menu={mockMenu} onAdd={onAdd} />)
    screen.getByRole('button').click()
    expect(onAdd).toHaveBeenCalledWith(mockMenu)
  })
})
