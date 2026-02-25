import { useI18n } from '../contexts'
import type { Menu } from '../types/api'

interface Props {
  menu: Menu
  onAdd: (menu: Menu) => void
}

export function MenuCard({ menu, onAdd }: Props) {
  const { locale } = useI18n()
  const name = locale === 'ko' ? menu.nameKo : menu.nameEn
  const desc = locale === 'ko' ? menu.descKo : menu.descEn

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {menu.imageUrl && <img src={menu.imageUrl} alt={name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }} />}
      <div style={{ fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{desc}</div>
      <div style={{ fontWeight: 600 }}>₩{menu.price.toLocaleString()}</div>
      <button onClick={() => onAdd(menu)} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+</button>
    </div>
  )
}
