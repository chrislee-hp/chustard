export interface Menu {
  id: string
  nameKo: string
  nameEn: string
  descKo: string
  descEn: string
  price: number
  imageUrl: string
  categoryId: string
}

export interface Category {
  id: string
  nameKo: string
  nameEn: string
  sortOrder: number
}

export interface Order {
  id: string
  tableId: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'preparing' | 'completed'
  createdAt: string
}

export interface OrderItem {
  menuId: string
  nameKo: string
  nameEn: string
  price: number
  quantity: number
}
