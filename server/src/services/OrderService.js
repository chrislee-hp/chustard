const VALID_TRANSITIONS = { pending: 'preparing', preparing: 'completed' };

class OrderService {
  constructor(orderRepo, tableRepo, menuRepo, sseService, orderHistoryRepo) {
    this.orderRepo = orderRepo; this.tableRepo = tableRepo;
    this.menuRepo = menuRepo; this.sseService = sseService;
    this.orderHistoryRepo = orderHistoryRepo;
  }

  createOrder(tableId, sessionId, items) {
    const table = this.tableRepo.findById(tableId);
    if (!table) throw new Error('VALIDATION_ERROR');
    const orderItems = items.map(item => {
      const menu = this.menuRepo.findById(item.menuId);
      if (!menu) throw new Error('VALIDATION_ERROR');
      return { menuId: item.menuId, nameKo: menu.nameKo, nameEn: menu.nameEn, price: menu.price, quantity: item.quantity };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = this.orderRepo.create({ tableId, sessionId, totalAmount }, orderItems);
    if (table.status === 'inactive') this.tableRepo.updateSession(tableId, sessionId, 'active');
    this.sseService.broadcast('order:created', order, table.storeId, tableId);
    return order;
  }

  getOrdersBySession(tableId, sessionId) { return this.orderRepo.findByTableSession(tableId, sessionId); }

  getAllOrders(storeId) { return this.orderRepo.findAllByStore(storeId); }

  updateOrderStatus(id, status) {
    const order = this.orderRepo.findById(id);
    if (!order) throw new Error('NOT_FOUND');
    if (VALID_TRANSITIONS[order.status] !== status) throw new Error('VALIDATION_ERROR');
    this.orderRepo.updateStatus(id, status);
    const table = this.tableRepo.findById(order.tableId);
    this.sseService.broadcast('order:status-changed', { orderId: id, status }, table.storeId, order.tableId);
    return { ...order, status };
  }

  deleteOrder(id) {
    const order = this.orderRepo.findById(id);
    if (!order) throw new Error('NOT_FOUND');
    this.orderRepo.softDelete(id);
    const table = this.tableRepo.findById(order.tableId);
    this.sseService.broadcast('order:deleted', { orderId: id }, table.storeId, order.tableId);
  }

  getOrderHistory(storeId, tableId, date) {
    return this.orderHistoryRepo ? this.orderHistoryRepo.findByFilters(storeId, tableId, date) : [];
  }
}
module.exports = OrderService;
