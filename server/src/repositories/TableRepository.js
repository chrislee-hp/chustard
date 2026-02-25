const { v4: uuidv4 } = require('uuid');

class TableRepository {
  constructor(db) { this.db = db; }

  findByStoreAndNumber(storeId, tableNumber) {
    return this.db.prepare('SELECT * FROM tables WHERE storeId = ? AND tableNumber = ?').get(storeId, tableNumber) || null;
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM tables WHERE id = ?').get(id) || null;
  }

  findAllByStore(storeId) {
    return this.db.prepare('SELECT * FROM tables WHERE storeId = ? ORDER BY tableNumber').all(storeId);
  }

  create(table) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash) VALUES (?, ?, ?, ?)').run(id, table.storeId, table.tableNumber, table.passwordHash);
    return this.findById(id);
  }

  updateSession(id, sessionId, status) {
    this.db.prepare('UPDATE tables SET currentSessionId = ?, status = ? WHERE id = ?').run(sessionId, status, id);
  }
}
module.exports = TableRepository;
