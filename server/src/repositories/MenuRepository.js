const { v4: uuidv4 } = require('uuid');

class MenuRepository {
  constructor(db) { this.db = db; }

  findAllByStoreGrouped(storeId) {
    const cats = this.db.prepare('SELECT * FROM categories WHERE storeId = ? ORDER BY sortOrder').all(storeId);
    return cats.map(cat => ({
      ...cat,
      menus: this.db.prepare('SELECT * FROM menus WHERE categoryId = ? ORDER BY sortOrder').all(cat.id)
    }));
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM menus WHERE id = ?').get(id) || null;
  }

  create(menu) {
    const id = uuidv4();
    const { categoryId, nameKo, nameEn, descKo = '', descEn = '', price, imageUrl = '', sortOrder = 0 } = menu;
    this.db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, descKo, descEn, price, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, categoryId, nameKo, nameEn, descKo, descEn, price, imageUrl, sortOrder);
    return this.findById(id);
  }

  update(id, data) {
    const current = this.findById(id);
    const { nameKo = current.nameKo, nameEn = current.nameEn, descKo = current.descKo, descEn = current.descEn, price = current.price, imageUrl = current.imageUrl, categoryId = current.categoryId, isAvailable = current.isAvailable } = data;
    this.db.prepare('UPDATE menus SET nameKo=?, nameEn=?, descKo=?, descEn=?, price=?, imageUrl=?, categoryId=?, isAvailable=? WHERE id=?').run(nameKo, nameEn, descKo, descEn, price, imageUrl, categoryId, isAvailable ? 1 : 0, id);
    return this.findById(id);
  }

  delete(id) {
    this.db.prepare('DELETE FROM menus WHERE id = ?').run(id);
  }

  updateSortOrders(idOrderPairs) {
    const stmt = this.db.prepare('UPDATE menus SET sortOrder = ? WHERE id = ?');
    const tx = this.db.transaction((pairs) => { for (const [id, order] of pairs) stmt.run(order, id); });
    tx(idOrderPairs);
  }

  maxSortOrder(categoryId) {
    const row = this.db.prepare('SELECT MAX(sortOrder) as max FROM menus WHERE categoryId = ?').get(categoryId);
    return row.max ?? -1;
  }
}
module.exports = MenuRepository;
