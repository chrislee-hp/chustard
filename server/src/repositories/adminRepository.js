export class AdminRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, storeId, username, passwordHash }) {
    const stmt = this.db.prepare(`
      INSERT INTO admins (id, store_id, username, password_hash)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, storeId, username, passwordHash);
    return this.findById(id);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM admins WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  findByStoreAndUsername(storeId, username) {
    const stmt = this.db.prepare('SELECT * FROM admins WHERE store_id = ? AND username = ?');
    const row = stmt.get(storeId, username);
    return row ? this.#mapRow(row) : null;
  }

  #mapRow(row) {
    return {
      id: row.id,
      storeId: row.store_id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at
    };
  }
}
