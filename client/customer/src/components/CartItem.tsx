import { useI18n } from '../contexts'
import type { CartItem as CartItemType } from '../types'

interface Props {
  item: CartItemType
  onIncrease: () => void
  onDecrease: () => void
}

export function CartItem({ item, onIncrease, onDecrease }: Props) {
  const { locale } = useI18n()
  const name = locale === 'ko' ? item.nameKo : item.nameEn
  const subtotal = item.price * item.quantity

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
      <div>
        <div style={{ fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#666' }}>₩{subtotal.toLocaleString()}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onDecrease} style={{ width: 28, height: 28, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>-</button>
        <span>{item.quantity}</span>
        <button onClick={onIncrease} style={{ width: 28, height: 28, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>+</button>
      </div>
    </div>
  )
}
