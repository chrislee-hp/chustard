const { v4: uuidv4 } = require('uuid');

class OrderRepository {
  constructor(db) { this.db = db; }

  create(order, items) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO orders (id, tableId, sessionId, totalAmount) VALUES (?, ?, ?, ?)').run(id, order.tableId, order.sessionId, order.totalAmount);
    const stmt = this.db.prepare('INSERT INTO order_items (id, orderId, menuId, nameKo, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of items) stmt.run(uuidv4(), id, item.menuId, item.nameKo, item.nameEn, item.price, item.quantity);
    return this.findById(id);
  }

  findById(id) {
    const order = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return null;
    order.items = this.db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(id);
    return order;
  }

  findByTableSession(tableId, sessionId) {
    const orders = this.db.prepare('SELECT * FROM orders WHERE tableId = ? AND sessionId = ? AND isDeleted = 0 ORDER BY createdAt').all(tableId, sessionId);
    return orders.map(o => ({ ...o, items: this.db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(o.id) }));
  }

  findAllByStore(storeId) {
    const tables = this.db.prepare('SELECT * FROM tables WHERE storeId = ?').all(storeId);
    return tables.map(t => {
      const orders = this.db.prepare('SELECT * FROM orders WHERE tableId = ? AND isDeleted = 0 ORDER BY createdAt').all(t.id);
      const ordersWithItems = orders.map(o => ({ ...o, items: this.db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(o.id) }));
      const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { tableId: t.id, tableNumber: t.tableNumber, status: t.status, orders: ordersWithItems, totalAmount };
    });
  }

  updateStatus(id, status) {
    this.db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  }

  softDelete(id) {
    this.db.prepare('UPDATE orders SET isDeleted = 1 WHERE id = ?').run(id);
  }

  deleteBySession(tableId, sessionId) {
    const orders = this.db.prepare('SELECT id FROM orders WHERE tableId = ? AND sessionId = ?').all(tableId, sessionId);
    for (const o of orders) this.db.prepare('DELETE FROM order_items WHERE orderId = ?').run(o.id);
    this.db.prepare('DELETE FROM orders WHERE tableId = ? AND sessionId = ?').run(tableId, sessionId);
  }
}
module.exports = OrderRepository;
