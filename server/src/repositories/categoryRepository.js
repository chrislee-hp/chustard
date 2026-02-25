export class CategoryRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, storeId, name, sortOrder = 0 }) {
    const stmt = this.db.prepare(`
      INSERT INTO categories (id, store_id, name, sort_order)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, storeId, name, sortOrder);
    return this.findById(id);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  findByStoreId(storeId) {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE store_id = ? ORDER BY sort_order');
    return stmt.all(storeId).map(row => this.#mapRow(row));
  }

  update(id, { name }) {
    const stmt = this.db.prepare('UPDATE categories SET name = ? WHERE id = ?');
    stmt.run(name, id);
    return this.findById(id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(id);
  }

  reorder(categoryIds) {
    const stmt = this.db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
    categoryIds.forEach((id, index) => stmt.run(index, id));
  }

  #mapRow(row) {
    return {
      id: row.id,
      storeId: row.store_id,
      name: row.name,
      sortOrder: row.sort_order,
      createdAt: row.created_at
    };
  }
}
