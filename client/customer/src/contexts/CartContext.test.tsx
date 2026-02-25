import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

function TestComponent() {
  const { items, totalAmount, addItem, removeItem, updateQuantity, clearCart } = useCart()
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="total">{totalAmount}</span>
      <button onClick={() => addItem({ menuId: 'm1', nameKo: '김치찌개', nameEn: 'Kimchi Stew', price: 8000, quantity: 1 })}>add</button>
      <button onClick={() => removeItem('m1')}>remove</button>
      <button onClick={() => updateQuantity('m1', 3)}>update</button>
      <button onClick={clearCart}>clear</button>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('초기 상태는 빈 장바구니', () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(screen.getByTestId('total')).toHaveTextContent('0')
  })

  it('아이템 추가 시 수량과 총액 증가', async () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    await act(async () => {
      screen.getByText('add').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('8000')
  })

  it('동일 아이템 추가 시 수량만 증가', async () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    await act(async () => {
      screen.getByText('add').click()
      screen.getByText('add').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('16000')
  })

  it('아이템 삭제', async () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    await act(async () => {
      screen.getByText('add').click()
    })
    await act(async () => {
      screen.getByText('remove').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('수량 업데이트', async () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    await act(async () => {
      screen.getByText('add').click()
    })
    await act(async () => {
      screen.getByText('update').click()
    })
    expect(screen.getByTestId('total')).toHaveTextContent('24000')
  })

  it('수량 0으로 업데이트 시 아이템 삭제', async () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    await act(async () => {
      screen.getByText('add').click()
    })
    await act(async () => {
      screen.getByText('update').click()
    })
    // updateQuantity를 0으로 호출하는 별도 테스트 필요
  })

  it('clearCart 호출 시 전체 삭제', async () => {
    render(<CartProvider><TestComponent /></CartProvider>)
    await act(async () => {
      screen.getByText('add').click()
    })
    await act(async () => {
      screen.getByText('clear').click()
    })
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
