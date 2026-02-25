const bcrypt = require('bcryptjs');

class TableService {
  constructor(tableRepo, orderRepo, orderHistoryRepo, sseService) {
    this.tableRepo = tableRepo; this.orderRepo = orderRepo;
    this.orderHistoryRepo = orderHistoryRepo; this.sseService = sseService;
  }

  createTable(storeId, tableNumber, password) {
    if (this.tableRepo.findByStoreAndNumber(storeId, tableNumber)) throw new Error('VALIDATION_ERROR');
    const passwordHash = bcrypt.hashSync(password, 10);
    return this.tableRepo.create({ storeId, tableNumber, passwordHash });
  }

  getTables(storeId) { return this.tableRepo.findAllByStore(storeId); }

  completeTable(id) {
    const table = this.tableRepo.findById(id);
    if (!table) throw new Error('NOT_FOUND');
    const orders = this.orderRepo.findByTableSession(table.id, table.currentSessionId);
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    this.orderHistoryRepo.create({
      storeId: table.storeId, tableNumber: table.tableNumber,
      sessionId: table.currentSessionId, ordersJson: JSON.stringify(orders), totalAmount
    });
    this.orderRepo.deleteBySession(table.id, table.currentSessionId);
    this.tableRepo.updateSession(table.id, null, 'inactive');
    this.sseService.broadcast('table:completed', { tableId: table.id }, table.storeId, table.id);
  }
}
module.exports = TableService;
