import { useState, useEffect } from 'react'
import { useAuth, useI18n } from '../contexts'
import { useApi, useSSE } from '../hooks'
import type { Order } from '../types/api'

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { tableId } = useAuth()
  const { t, locale } = useI18n()
  const { get } = useApi()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await get<{ orders: Order[] }>('/api/orders')
        setOrders(data.orders)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [get])

  useSSE(tableId ? `/api/sse/orders?tableId=${tableId}` : null, {
    onOrderStatusChanged: (data) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status as Order['status'] } : o))
    },
  })

  const getStatusLabel = (status: Order['status']) => {
    return t(`status.${status}`)
  }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>{t('orderHistory')}</h2>
      {orders.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>No orders yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>#{order.id.slice(-6)}</span>
                <span style={{ padding: '2px 8px', borderRadius: 12, background: order.status === 'completed' ? '#4caf50' : '#ff9800', color: '#fff', fontSize: 12 }}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
                {order.items.map(item => (
                  <div key={item.menuId}>{locale === 'ko' ? item.nameKo : item.nameEn} x{item.quantity}</div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>₩{order.totalAmount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
