export class LoginAttemptRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, adminId, success }) {
    const stmt = this.db.prepare(`
      INSERT INTO login_attempts (id, admin_id, success)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, adminId, success ? 1 : 0);
    return this.findById(id);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM login_attempts WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  countRecentFailures(adminId, minutes) {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM login_attempts 
      WHERE admin_id = ? AND success = 0 
      AND attempted_at > datetime('now', '-' || ? || ' minutes')
    `);
    return stmt.get(adminId, minutes).count;
  }

  #mapRow(row) {
    return {
      id: row.id,
      adminId: row.admin_id,
      attemptedAt: row.attempted_at,
      success: row.success
    };
  }
}
