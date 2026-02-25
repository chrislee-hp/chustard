const { v4: uuidv4 } = require('uuid');

class CategoryRepository {
  constructor(db) { this.db = db; }

  findAllByStore(storeId) {
    return this.db.prepare('SELECT * FROM categories WHERE storeId = ? ORDER BY sortOrder').all(storeId);
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id) || null;
  }

  create(cat) {
    const id = uuidv4();
    const sortOrder = cat.sortOrder ?? 0;
    this.db.prepare('INSERT INTO categories (id, storeId, name, nameEn, sortOrder) VALUES (?, ?, ?, ?, ?)').run(id, cat.storeId, cat.name, cat.nameEn || '', sortOrder);
    return this.findById(id);
  }

  update(id, data) {
    this.db.prepare('UPDATE categories SET name = ?, nameEn = ? WHERE id = ?').run(data.name, data.nameEn || '', id);
    return this.findById(id);
  }

  delete(id) {
    this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  }

  updateSortOrders(idOrderPairs) {
    const stmt = this.db.prepare('UPDATE categories SET sortOrder = ? WHERE id = ?');
    const tx = this.db.transaction((pairs) => { for (const [id, order] of pairs) stmt.run(order, id); });
    tx(idOrderPairs);
  }

  countMenus(categoryId) {
    return this.db.prepare('SELECT COUNT(*) as cnt FROM menus WHERE categoryId = ?').get(categoryId).cnt;
  }
}
module.exports = CategoryRepository;
