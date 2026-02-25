import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCart, useI18n } from '../contexts'
import { useSSE } from '../hooks'
import { LanguageToggle, CartItem } from '../components'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ShoppingCart, X, UtensilsCrossed, History } from 'lucide-react'

export function Header() {
  const { t } = useI18n()
  return (
    <header className="glass-effect sticky top-0 z-40 flex justify-between items-center px-6 py-4 border-b border-orange-200/50">
      <Link to="/menu" className="font-bold text-2xl no-underline text-orange-600 flex items-center gap-2 hover:text-orange-700 transition-colors">
        <UtensilsCrossed className="w-7 h-7" />
        맛있는 주문
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/menu">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium">
            메뉴
          </Button>
        </Link>
        <Link to="/orders">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium flex items-center gap-1">
            <History className="w-4 h-4" />
            주문내역
          </Button>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  )
}

export function CartPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalAmount, updateQuantity } = useCart()
  const { t } = useI18n()
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 w-96 h-full glass-effect z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b border-orange-200/50 bg-gradient-to-r from-orange-50 to-amber-50">
          <h3 className="font-bold text-xl text-orange-600 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            {t('cart')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-orange-100">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">장바구니가 비어있습니다</p>
            </div>
          ) : (
            items.map(item => (
              <CartItem
                key={item.menuId}
                item={item}
                onIncrease={() => updateQuantity(item.menuId, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.menuId, item.quantity - 1)}
              />
            ))
          )}
        </div>
        <div className="p-6 border-t border-orange-200/50 space-y-4 bg-gradient-to-t from-orange-50 to-transparent">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">총 금액</span>
            <span className="font-bold text-3xl text-orange-600">₩{totalAmount.toLocaleString()}</span>
          </div>
          <Button
            onClick={() => { onClose(); navigate('/order-confirm'); }}
            disabled={items.length === 0}
            size="lg"
            className="w-full gradient-food hover:opacity-90 transition-opacity shadow-lg text-lg font-bold"
          >
            주문하기
          </Button>
        </div>
      </div>
    </>
  )
}

export function CartToggleButton({ onClick, itemCount }: { onClick: () => void; itemCount: number }) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl gradient-food hover:opacity-90 transition-all hover:scale-110"
    >
      <ShoppingCart className="w-7 h-7" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center p-0 text-sm font-bold bg-red-500 border-2 border-white animate-bounce">
          {itemCount}
        </Badge>
      )}
    </Button>
  )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const { items } = useCart()
  const { tableId, token, setExpired } = useAuth()
  const navigate = useNavigate()

  useSSE(tableId && token ? `/api/sse/orders?tableId=${tableId}&token=${token}` : null, {
    onTableCompleted: () => {
      setExpired()
      navigate('/session-expired')
    },
  })

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24">{children}</main>
      <CartToggleButton onClick={() => setCartOpen(true)} itemCount={items.length} />
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
