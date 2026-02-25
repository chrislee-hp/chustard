import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, useI18n, useToast } from '../contexts'
import { useApi } from '../hooks'
import { CartItem } from '../components'

export function OrderConfirmPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { items, totalAmount, clearCart, updateQuantity } = useCart()
  const { t } = useI18n()
  const { showToast } = useToast()
  const { post } = useApi()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (items.length === 0) return
    setIsSubmitting(true)
    try {
      const res = await post<{ orderId: string }>('/api/orders', {
        items: items.map(i => ({ menuId: i.menuId, quantity: i.quantity })),
      })
      clearCart()
      navigate('/order-success', { state: { orderId: res.orderId } })
    } catch {
      showToast(t('error.orderFailed'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 400, margin: '0 auto' }}>
      <h2>{t('orderConfirm')}</h2>
      <div style={{ marginTop: 16 }}>
        {items.map(item => (
          <CartItem
            key={item.menuId}
            item={item}
            onIncrease={() => updateQuantity(item.menuId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.menuId, item.quantity - 1)}
          />
        ))}
      </div>
      <div style={{ marginTop: 16, fontWeight: 600, fontSize: 18 }}>
        Total: ₩{totalAmount.toLocaleString()}
      </div>
      <button
        onClick={handleSubmit}
        disabled={items.length === 0 || isSubmitting}
        style={{ width: '100%', marginTop: 16, padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        {isSubmitting ? '...' : t('orderConfirm')}
      </button>
      <button onClick={() => navigate('/menu')} style={{ width: '100%', marginTop: 8, padding: 12, background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        {t('menu')}
      </button>
    </div>
  )
}
