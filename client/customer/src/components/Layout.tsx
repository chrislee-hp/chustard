import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCart, useI18n } from '../contexts'
import { useSSE } from '../hooks'
import { LanguageToggle, CartItem } from '../components'

export function Header() {
  const { t } = useI18n()
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
      <Link to="/menu" style={{ fontWeight: 600, textDecoration: 'none', color: '#333' }}>🍽️ Table Order</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/orders" style={{ textDecoration: 'none', color: '#333' }}>{t('orderHistory')}</Link>
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
    <div style={{ position: 'fixed', top: 0, right: 0, width: 300, height: '100%', background: '#fff', boxShadow: '-2px 0 8px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid #eee' }}>
        <h3>{t('cart')}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {items.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Empty</p>
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
      <div style={{ padding: 16, borderTop: '1px solid #eee' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Total: ₩{totalAmount.toLocaleString()}</div>
        <button
          onClick={() => { onClose(); navigate('/order-confirm'); }}
          disabled={items.length === 0}
          style={{ width: '100%', padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: items.length ? 'pointer' : 'not-allowed' }}
        >
          {t('order')}
        </button>
      </div>
    </div>
  )
}

export function CartToggleButton({ onClick, itemCount }: { onClick: () => void; itemCount: number }) {
  return (
    <button
      onClick={onClick}
      style={{ position: 'fixed', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#1976d2', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
    >
      🛒{itemCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#f44336', borderRadius: '50%', width: 20, height: 20, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>}
    </button>
  )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const { items } = useCart()
  const { tableId, setExpired } = useAuth()
  const navigate = useNavigate()

  useSSE(tableId ? `/api/sse/orders?tableId=${tableId}` : null, {
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
