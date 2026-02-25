import { useState, useEffect } from 'react'
import { useAuth, useI18n } from '../contexts'
import { useApi, useSSE } from '../hooks'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Clock, ChefHat, Check, Receipt } from 'lucide-react'
import type { Order } from '../types/api'

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { tableId, token } = useAuth()
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

  useSSE(tableId && token ? `/api/sse/orders?tableId=${tableId}&token=${token}` : null, {
    onOrderStatusChanged: (data) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status as Order['status'] } : o))
    },
  })

  if (isLoading) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl gradient-food flex items-center justify-center">
          <Receipt className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t('orderHistory')}</h2>
      </div>
      
      {orders.length === 0 ? (
        <Card className="glass-effect border-0 p-12 text-center">
          <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('noOrders')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className={`
              gradient-card border-0 shadow-lg overflow-hidden border-l-4
              ${order.status === 'pending' ? 'border-l-yellow-500' : ''}
              ${order.status === 'preparing' ? 'border-l-blue-500' : ''}
              ${order.status === 'completed' ? 'border-l-green-500' : ''}
            `}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-gray-800">#{String(order.id).slice(-6)}</span>
                  <Badge className={`
                    ${order.status === 'pending' ? 'bg-yellow-500' : ''}
                    ${order.status === 'preparing' ? 'bg-blue-500' : ''}
                    ${order.status === 'completed' ? 'bg-green-500' : ''}
                    text-white
                  `}>
                    {order.status === 'pending' && <><Clock className="w-3 h-3 mr-1" />{t('status.pending')}</>}
                    {order.status === 'preparing' && <><ChefHat className="w-3 h-3 mr-1" />{t('status.preparing')}</>}
                    {order.status === 'completed' && <><Check className="w-3 h-3 mr-1" />{t('status.completed')}</>}
                  </Badge>
                </div>
                
                <div className="space-y-1 mb-3">
                  {order.items.map(item => (
                    <div key={item.menuId} className="flex justify-between text-sm">
                      <span className="text-gray-600">{locale === 'ko' ? item.nameKo : item.nameEn} × {item.quantity}</span>
                      <span className="text-gray-800">₩{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-600">{t('totalAmount')}</span>
                  <span className="font-bold text-xl text-orange-600">₩{order.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
