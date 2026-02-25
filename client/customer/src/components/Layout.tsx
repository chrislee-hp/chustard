import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCart, useI18n } from '../contexts'
import { useSSE } from '../hooks'
import { LanguageToggle, CartItem } from '../components'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ShoppingCart, X } from 'lucide-react'

export function Header() {
  const { t } = useI18n()
  return (
    <header className="flex justify-between items-center px-4 py-3 border-b">
      <Link to="/menu" className="font-semibold text-lg no-underline text-foreground">
        🍽️ Table Order
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/orders" className="no-underline text-foreground hover:text-primary">
          {t('orderHistory')}
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
    <div className="fixed top-0 right-0 w-80 h-full bg-background shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-lg">{t('cart')}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center">Empty</p>
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
      <div className="p-4 border-t space-y-3">
        <div className="font-semibold">Total: ₩{totalAmount.toLocaleString()}</div>
        <Button
          onClick={() => { onClose(); navigate('/order-confirm'); }}
          disabled={items.length === 0}
          className="w-full"
        >
          {t('order')}
        </Button>
      </div>
    </div>
  )
}

export function CartToggleButton({ onClick, itemCount }: { onClick: () => void; itemCount: number }) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-lg"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
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
    <div>
      <Header />
      <main>{children}</main>
      <CartToggleButton onClick={() => setCartOpen(true)} itemCount={items.length} />
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
