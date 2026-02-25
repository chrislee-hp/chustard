import { useI18n } from '../contexts'
import type { CartItem as CartItemType } from '../types'
import { Button } from './ui/button'
import { Minus, Plus } from 'lucide-react'

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
    <div className="flex justify-between items-center py-2 border-b">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">₩{subtotal.toLocaleString()}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onDecrease} size="icon" variant="outline" className="h-7 w-7">
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button onClick={onIncrease} size="icon" variant="outline" className="h-7 w-7">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}
