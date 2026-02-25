import { saveDb } from '../db/database.js';

export class OrderRepository {
  constructor(db) {
    this.db = db;
  }

  create({ sessionId, tableId, totalAmount }) {
    this.db.run(`
      INSERT INTO orders (session_id, table_id, total_amount, status)
      VALUES (?, ?, ?, 'pending')
    `, [sessionId, tableId, totalAmount]);
    
    // saveDb 전에 lastId 가져오기 (saveDb 후에는 0 반환됨)
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const lastId = result[0]?.values[0]?.[0];
    saveDb();
    
    return this.findById(lastId);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.#mapRow(row);
    }
    stmt.free();
    return null;
  }

  findBySessionId(sessionId) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE session_id = ? AND deleted_at IS NULL ORDER BY created_at');
    stmt.bind([sessionId]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows.map(row => this.#mapRow(row));
  }

  findByTableId(tableId) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE table_id = ? AND deleted_at IS NULL ORDER BY created_at');
    stmt.bind([tableId]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows.map(row => this.#mapRow(row));
  }

  updateStatus(id, status) {
    this.db.run('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, id]);
    saveDb();
    return this.findById(id);
  }

  softDelete(id) {
    this.db.run('UPDATE orders SET deleted_at = datetime("now") WHERE id = ?', [id]);
    saveDb();
  }

  #mapRow(row) {
    return {
      id: row.id,
      sessionId: row.session_id,
      tableId: row.table_id,
      status: row.status,
      totalAmount: row.total_amount,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
