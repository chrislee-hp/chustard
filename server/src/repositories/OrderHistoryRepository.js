const { v4: uuidv4 } = require('uuid');

class OrderHistoryRepository {
  constructor(db) { this.db = db; }

  create(history) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO order_history (id, storeId, tableNumber, sessionId, ordersJson, totalAmount) VALUES (?, ?, ?, ?, ?, ?)').run(id, history.storeId, history.tableNumber, history.sessionId, history.ordersJson, history.totalAmount);
    return this.db.prepare('SELECT * FROM order_history WHERE id = ?').get(id);
  }

  findByFilters(storeId, tableId, date) {
    let sql = 'SELECT * FROM order_history WHERE storeId = ?';
    const params = [storeId];
    if (tableId) { sql += ' AND tableNumber = (SELECT tableNumber FROM tables WHERE id = ?)'; params.push(tableId); }
    if (date) { sql += ' AND DATE(completedAt) = ?'; params.push(date); }
    sql += ' ORDER BY completedAt DESC';
    return this.db.prepare(sql).all(...params).map(r => {
      const orders = JSON.parse(r.ordersJson || '[]');
      const items = orders.flatMap(o => o.items || []);
      return { ...r, items, ordersJson: undefined };
    });
  }
}
module.exports = OrderHistoryRepository;
