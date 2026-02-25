export interface AuthState {
  token: string | null
  tableId: string | null
  sessionId: string | null
  storeId: string | null
  isAuthenticated: boolean
}

export interface CartItem {
  menuId: string
  nameKo: string
  nameEn: string
  price: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  totalAmount: number
}

export type Locale = 'ko' | 'en'

export interface I18nState {
  locale: Locale
  t: (key: string) => string
}

export type ToastType = 'success' | 'error'

export interface Toast {
  id: string
  message: string
  type: ToastType
}
