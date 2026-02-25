import { createStatement, saveDb } from '../db/database.js';

export class TableSessionRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, tableId }) {
    const stmt = createStatement(this.db, `
      INSERT INTO table_sessions (id, table_id)
      VALUES (?, ?)
    `);
    stmt.run(id, tableId);
    return this.findById(id);
  }

  findById(id) {
    const stmt = createStatement(this.db, 'SELECT * FROM table_sessions WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  endSession(id) {
    const stmt = createStatement(this.db, 'UPDATE table_sessions SET ended_at = datetime("now") WHERE id = ?');
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
