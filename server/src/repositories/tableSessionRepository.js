export class TableSessionRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, tableId }) {
    const stmt = this.db.prepare(`
      INSERT INTO table_sessions (id, table_id)
      VALUES (?, ?)
    `);
    stmt.run(id, tableId);
    return this.findById(id);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM table_sessions WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  endSession(id) {
    const stmt = this.db.prepare('UPDATE table_sessions SET ended_at = datetime("now") WHERE id = ?');
    stmt.run(id);
  }

  #mapRow(row) {
    return {
      id: row.id,
      tableId: row.table_id,
      startedAt: row.started_at,
      endedAt: row.ended_at
    };
  }
}
