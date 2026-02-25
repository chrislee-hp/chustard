import { useState, useEffect } from 'react'
import { useCart, useToast } from '../contexts'
import { useApi } from '../hooks'
import { MenuCard, CategoryTabs } from '../components'
import type { Menu, Category } from '../types/api'

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { addItem } = useCart()
  const { showToast } = useToast()
  const { get } = useApi()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get<{ categories: Category[]; menus: Menu[] }>('/api/menus')
        setCategories(data.categories)
        setMenus(data.menus)
        if (data.categories.length > 0) {
          setSelectedCategoryId(data.categories[0].id)
        }
      } catch {
        showToast('Failed to load menus', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [get, showToast])

  const filteredMenus = selectedCategoryId ? menus.filter(m => m.categoryId === selectedCategoryId) : menus

  const handleAddToCart = (menu: Menu) => {
    addItem({
      menuId: menu.id,
      nameKo: menu.nameKo,
      nameEn: menu.nameEn,
      price: menu.price,
      quantity: 1,
    })
  }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>

  return (
    <div style={{ padding: 16 }}>
      <CategoryTabs categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginTop: 16 }}>
        {filteredMenus.map(menu => (
          <MenuCard key={menu.id} menu={menu} onAdd={handleAddToCart} />
        ))}
      </div>
    </div>
  )
}
