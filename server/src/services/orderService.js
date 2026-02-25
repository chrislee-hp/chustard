import { v4 as uuidv4 } from 'uuid';
import { transaction } from '../db/database.js';

const VALID_TRANSITIONS = {
  pending: ['preparing'],
  preparing: ['completed'],
  completed: []
};

export class OrderService {
  constructor(orderRepo, orderItemRepo, menuRepo, tableRepo, sseService) {
    this.orderRepo = orderRepo;
    this.orderItemRepo = orderItemRepo;
    this.menuRepo = menuRepo;
    this.tableRepo = tableRepo;
    this.sseService = sseService;
  }

  createOrder(tableId, sessionId, items) {
    const table = this.tableRepo.findById(tableId);
    if (!table || table.currentSessionId !== sessionId) throw new Error('UNAUTHORIZED');

    let totalAmount = 0;
    const validatedItems = items.map(item => {
      const menu = this.menuRepo.findById(item.menuId);
      if (!menu) throw new Error('NOT_FOUND');
      if (item.quantity < 1 || item.quantity > 99) throw new Error('VALIDATION_ERROR');
      totalAmount += menu.price * item.quantity;
      return { ...item, nameKo: menu.nameKo, nameEn: menu.nameEn, price: menu.price };
    });

    // 주문 생성
    const order = this.orderRepo.create({ sessionId, tableId, totalAmount });
    if (!order) throw new Error('ORDER_CREATE_FAILED');
    
    // 주문 항목 생성
    validatedItems.forEach(item => {
      this.orderItemRepo.create({
        id: uuidv4(), orderId: order.id, menuId: item.menuId,
        nameKo: item.nameKo, nameEn: item.nameEn, quantity: item.quantity, price: item.price
      });
    });

    const orderWithItems = { ...order, items: this.orderItemRepo.findByOrderId(order.id) };
    this.sseService.broadcast('order:created', { order: orderWithItems }, { tableId, storeId: table.storeId });
    return orderWithItems;
  }

  getOrdersBySession(tableId, sessionId) {
    const orders = this.orderRepo.findBySessionId(sessionId);
    return orders.map(order => ({
      ...order,
      items: this.orderItemRepo.findByOrderId(order.id)
    }));
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orderRepo.findById(orderId);
    if (!order) throw new Error('NOT_FOUND');
    if (!VALID_TRANSITIONS[order.status]?.includes(newStatus)) throw new Error('VALIDATION_ERROR');

    const updated = this.orderRepo.updateStatus(orderId, newStatus);
    const table = this.tableRepo.findById(order.tableId);
    this.sseService.broadcast('order:status-changed', { orderId, status: newStatus }, { tableId: order.tableId, storeId: table?.storeId });
    return updated;
  }

  deleteOrder(orderId) {
    const order = this.orderRepo.findById(orderId);
    if (!order) throw new Error('NOT_FOUND');

    this.orderRepo.softDelete(orderId);
    const table = this.tableRepo.findById(order.tableId);
    this.sseService.broadcast('order:deleted', { orderId }, { tableId: order.tableId, storeId: table?.storeId });
  }

  getAdminDashboard(storeId) {
    const tables = this.tableRepo.findByStoreId(storeId);
    return tables.map(table => {
      const orders = this.orderRepo.findByTableId(table.id);
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: this.orderItemRepo.findByOrderId(order.id).map(item => ({
          menuId: item.menuId,
          menuName: item.nameKo,
          menuNameEn: item.nameEn,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      }));
      return {
        id: table.id,
        tableNumber: String(table.tableNumber),
        isActive: table.status === 'active',
        currentSessionId: table.currentSessionId,
        totalAmount: ordersWithItems.reduce((sum, o) => sum + o.totalAmount, 0),
        orderCount: ordersWithItems.length,
        lastOrderAt: ordersWithItems.length > 0 ? ordersWithItems[ordersWithItems.length - 1].createdAt : null,
        orders: ordersWithItems,
      };
    });
  }
}
