import { createStatement, saveDb } from '../db/database.js';

export class TableRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, storeId, tableNumber, password }) {
    const stmt = createStatement(this.db, `
      INSERT INTO tables (id, store_id, table_number, password, status)
      VALUES (?, ?, ?, ?, 'inactive')
    `);
    stmt.run(id, storeId, tableNumber, password);
    return this.findById(id);
  }

  findById(id) {
    const stmt = createStatement(this.db, 'SELECT * FROM tables WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  findByStoreAndNumber(storeId, tableNumber) {
    const stmt = createStatement(this.db, 'SELECT * FROM tables WHERE store_id = ? AND table_number = ?');
    const row = stmt.get(storeId, tableNumber);
    return row ? this.#mapRow(row) : null;
  }

  findByStoreId(storeId) {
    const stmt = createStatement(this.db, 'SELECT * FROM tables WHERE store_id = ? ORDER BY table_number');
    return stmt.all(storeId).map(row => this.#mapRow(row));
  }

  updateSession(id, sessionId, status) {
    const stmt = createStatement(this.db, 'UPDATE tables SET current_session_id = ?, status = ? WHERE id = ?');
    stmt.run(sessionId, status, id);
  }

  #mapRow(row) {
    return {
      id: row.id,
      storeId: row.store_id,
      tableNumber: row.table_number,
      password: row.password,
      status: row.status,
      currentSessionId: row.current_session_id,
      createdAt: row.created_at
    };
  }
}
