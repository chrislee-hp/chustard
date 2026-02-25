import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, useI18n, useToast } from '../contexts'
import { useApi } from '../hooks'
import { CartItem } from '../components'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

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
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('orderConfirm')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map(item => (
              <CartItem
                key={item.menuId}
                item={item}
                onIncrease={() => updateQuantity(item.menuId, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.menuId, item.quantity - 1)}
              />
            ))}
          </div>
          <div className="font-semibold text-lg pt-4 border-t">
            Total: ₩{totalAmount.toLocaleString()}
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={items.length === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? '...' : t('orderConfirm')}
            </Button>
            <Button onClick={() => navigate('/menu')} variant="outline" className="w-full">
              {t('menu')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
