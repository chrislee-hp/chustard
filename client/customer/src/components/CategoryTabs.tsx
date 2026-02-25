import { useI18n } from '../contexts'
import type { Category } from '../types/api'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

interface Props {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function CategoryTabs({ categories, selectedId, onSelect }: Props) {
  const { locale } = useI18n()
  return (
    <Tabs value={selectedId || undefined} onValueChange={onSelect} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {categories.map(cat => (
          <TabsTrigger key={cat.id} value={cat.id}>
            {locale === 'ko' ? cat.nameKo : cat.nameEn}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
