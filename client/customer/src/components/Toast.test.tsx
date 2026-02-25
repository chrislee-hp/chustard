import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toast } from './Toast'

describe('Toast', () => {
  it('success 타입 렌더링', () => {
    render(<Toast message="성공!" type="success" onClose={() => {}} />)
    expect(screen.getByText('성공!')).toBeInTheDocument()
  })

  it('error 타입 렌더링', () => {
    render(<Toast message="에러!" type="error" onClose={() => {}} />)
    expect(screen.getByText('에러!')).toBeInTheDocument()
  })

  it('닫기 버튼 클릭 시 onClose 호출', async () => {
    const onClose = vi.fn()
    render(<Toast message="테스트" type="success" onClose={onClose} />)
    screen.getByRole('button').click()
    expect(onClose).toHaveBeenCalled()
  })
})
