import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  totalAmount: number
  addItem: (item: CartItem) => void
  removeItem: (menuId: string) => void
  updateQuantity: (menuId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'cart_items'

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuId === item.menuId)
      if (existing) {
        return prev.map(i => i.menuId === item.menuId ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((menuId: string) => {
    setItems(prev => prev.filter(i => i.menuId !== menuId))
  }, [])

  const updateQuantity = useCallback((menuId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.menuId !== menuId))
    } else {
      setItems(prev => prev.map(i => i.menuId === menuId ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  return (
    <CartContext.Provider value={{ items, totalAmount: calculateTotal(items), addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
