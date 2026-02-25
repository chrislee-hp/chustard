import { useI18n } from '../contexts'
import type { Category } from '../types/api'
import { Button } from './ui/button'

interface Props {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function CategoryTabs({ categories, selectedId, onSelect }: Props) {
  const { locale } = useI18n()
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
      {categories.map(cat => (
        <Button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          variant={selectedId === cat.id ? "default" : "outline"}
          size="lg"
          className={`
            whitespace-nowrap rounded-full font-semibold min-w-[100px] transition-all
            ${selectedId === cat.id 
              ? 'gradient-food shadow-lg scale-105' 
              : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
            }
          `}
        >
          {locale === 'ko' ? cat.nameKo : cat.nameEn}
        </Button>
      ))}
    </div>
  )
}
