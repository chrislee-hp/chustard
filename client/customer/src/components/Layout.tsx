import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCart, useI18n } from '../contexts'
import { useSSE } from '../hooks'
import { LanguageToggle, CartItem } from '../components'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ShoppingCart, X, Sparkles } from 'lucide-react'

export function Header() {
  const { t } = useI18n()
  return (
    <header className="glass-effect sticky top-0 z-40 flex justify-between items-center px-4 py-3 border-b border-white/20">
      <Link to="/menu" className="font-bold text-xl no-underline bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        Table Order
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/orders" className="no-underline text-foreground hover:text-purple-600 transition-colors font-medium">
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
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 w-80 h-full glass-effect z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('cart')}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-purple-100">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Empty</p>
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
        <div className="p-4 border-t border-white/20 space-y-3 bg-gradient-to-t from-purple-50/50 to-transparent">
          <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Total: ₩{totalAmount.toLocaleString()}
          </div>
          <Button
            onClick={() => { onClose(); navigate('/order-confirm'); }}
            disabled={items.length === 0}
            className="w-full gradient-primary hover:opacity-90 transition-opacity shadow-lg"
          >
            {t('order')}
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
      className="fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-2xl gradient-primary hover:opacity-90 transition-all hover:scale-110 animate-pulse"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <Badge className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center p-0 text-xs bg-pink-500 border-2 border-white animate-bounce">
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
      <main className="pb-20">{children}</main>
      <CartToggleButton onClick={() => setCartOpen(true)} itemCount={items.length} />
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
