export class OrderRepository {
  constructor(db) {
    this.db = db;
  }

  create({ sessionId, tableId, totalAmount }) {
    const stmt = this.db.prepare(`
      INSERT INTO orders (session_id, table_id, total_amount, status)
      VALUES (?, ?, ?, 'pending')
    `);
    const result = stmt.run(sessionId, tableId, totalAmount);
    return this.findById(result.lastInsertRowid);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  findBySessionId(sessionId) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE session_id = ? AND deleted_at IS NULL ORDER BY created_at');
    return stmt.all(sessionId).map(row => this.#mapRow(row));
  }

  findByTableId(tableId) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE table_id = ? AND deleted_at IS NULL ORDER BY created_at');
    return stmt.all(tableId).map(row => this.#mapRow(row));
  }

  updateStatus(id, status) {
    const stmt = this.db.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?');
    stmt.run(status, id);
    return this.findById(id);
  }

  softDelete(id) {
    const stmt = this.db.prepare('UPDATE orders SET deleted_at = datetime("now") WHERE id = ?');
    stmt.run(id);
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
