import { useI18n } from '../contexts'
import type { Category } from '../types/api'

interface Props {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function CategoryTabs({ categories, selectedId, onSelect }: Props) {
  const { locale } = useI18n()
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 20,
            background: selectedId === cat.id ? '#1976d2' : '#eee',
            color: selectedId === cat.id ? '#fff' : '#333',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {locale === 'ko' ? cat.nameKo : cat.nameEn}
        </button>
      ))}
    </div>
  )
}
