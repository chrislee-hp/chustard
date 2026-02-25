import { useI18n } from '../contexts'
import type { Menu } from '../types/api'
import { Card, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

interface Props {
  menu: Menu
  onAdd: (menu: Menu) => void
}

export function MenuCard({ menu, onAdd }: Props) {
  const { locale } = useI18n()
  const name = locale === 'ko' ? menu.nameKo : menu.nameEn
  const desc = locale === 'ko' ? menu.descKo : menu.descEn

  return (
    <Card className="overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 gradient-card border-0">
      {menu.imageUrl && (
        <div className="relative overflow-hidden">
          <img src={menu.imageUrl} alt={name} className="w-full h-32 object-cover transition-transform duration-300 hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
        <p className="font-bold text-lg text-purple-600">₩{menu.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button onClick={() => onAdd(menu)} size="sm" className="w-full gradient-primary hover:opacity-90 transition-opacity shadow-lg">
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </CardFooter>
    </Card>
  )
}
