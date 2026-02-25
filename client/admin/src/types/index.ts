// Core Domain Types

export interface AdminUser {
  id: string;
  storeId: string;
  username: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface LoginCredentials {
  storeId: string;
  username: string;
  password: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  tokenExpiry: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface OrderItem {
  menuId: string;
  menuName: string;
  menuNameEn: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sessionId: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  isActive: boolean;
  currentSessionId: string | null;
  totalAmount: number;
  orderCount: number;
  lastOrderAt: string | null;
  orders: Order[];
}

export interface Menu {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  displayOrder: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameKo: string;
  nameEn: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFormData {
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  price: number;
  categoryId: string;
  imageUrl: string;
}

// Validation Types

export interface ValidationError {
  field: string;
  message: string;
}

// SSE Event Types

export interface OrderCreatedEvent {
  type: 'order:created';
  data: Order;
}

export interface OrderUpdatedEvent {
  type: 'order:updated';
  data: Order;
}

export interface OrderDeletedEvent {
  type: 'order:deleted';
  data: { orderId: string; tableId: string };
}

export type SSEEvent = OrderCreatedEvent | OrderUpdatedEvent | OrderDeletedEvent;
