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
    <Card className="overflow-hidden">
      {menu.imageUrl && (
        <img src={menu.imageUrl} alt={name} className="w-full h-32 object-cover" />
      )}
      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <p className="font-semibold">₩{menu.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button onClick={() => onAdd(menu)} size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </CardFooter>
    </Card>
  )
}
