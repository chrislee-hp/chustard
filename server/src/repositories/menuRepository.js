import { createStatement, saveDb } from '../db/database.js';

export class MenuRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, categoryId, nameKo, nameEn, descKo = null, descEn = null, price, imageUrl = null, sortOrder = 0 }) {
    const stmt = createStatement(this.db, `
      INSERT INTO menus (id, category_id, name_ko, name_en, desc_ko, desc_en, price, image_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, categoryId, nameKo, nameEn, descKo, descEn, price, imageUrl, sortOrder);
    return this.findById(id);
  }

  findById(id) {
    const stmt = createStatement(this.db, 'SELECT * FROM menus WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  findByCategoryId(categoryId) {
    const stmt = createStatement(this.db, 'SELECT * FROM menus WHERE category_id = ? ORDER BY sort_order');
    return stmt.all(categoryId).map(row => this.#mapRow(row));
  }

  countByCategoryId(categoryId) {
    const stmt = createStatement(this.db, 'SELECT COUNT(*) as count FROM menus WHERE category_id = ?');
    return stmt.get(categoryId)?.count || 0;
  }

  update(id, { nameKo, nameEn, descKo, descEn, price, imageUrl, categoryId }) {
    const menu = this.findById(id);
    const stmt = createStatement(this.db, `
      UPDATE menus SET name_ko = ?, name_en = ?, desc_ko = ?, desc_en = ?, price = ?, image_url = ?, category_id = ?
      WHERE id = ?
    `);
    stmt.run(
      nameKo ?? menu.nameKo, nameEn ?? menu.nameEn, descKo ?? menu.descKo, descEn ?? menu.descEn,
      price ?? menu.price, imageUrl ?? menu.imageUrl, categoryId ?? menu.categoryId, id
    );
    return this.findById(id);
  }

  delete(id) {
    const stmt = createStatement(this.db, 'DELETE FROM menus WHERE id = ?');
    stmt.run(id);
  }

  reorder(menuIds) {
    menuIds.forEach((id, index) => {
      const stmt = createStatement(this.db, 'UPDATE menus SET sort_order = ? WHERE id = ?');
      stmt.run(index, id);
    });
  }

  #mapRow(row) {
    return {
      id: row.id,
      categoryId: row.category_id,
      nameKo: row.name_ko,
      nameEn: row.name_en,
      descKo: row.desc_ko,
      descEn: row.desc_en,
      price: row.price,
      imageUrl: row.image_url,
      sortOrder: row.sort_order,
      createdAt: row.created_at
    };
  }
}
