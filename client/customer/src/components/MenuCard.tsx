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
    <Card className={`overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 gradient-card border-0 food-shadow ${menu.soldOut ? 'opacity-50' : ''}`}>
      {menu.imageUrl && (
        <div className="relative overflow-hidden group">
          <img src={menu.imageUrl} alt={name} className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-lg text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{desc}</p>
        <p className="font-bold text-2xl text-orange-600">₩{menu.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {menu.soldOut ? (
          <span data-testid="sold-out-badge" className="w-full text-center py-2 px-4 bg-gray-400 text-white rounded-md font-semibold">품절</span>
        ) : (
          <Button onClick={() => onAdd(menu)} size="lg" className="w-full gradient-food hover:opacity-90 transition-opacity shadow-lg text-base font-semibold">
            <Plus className="w-5 h-5 mr-1" />
            담기
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
