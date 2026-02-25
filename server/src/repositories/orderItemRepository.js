import { createStatement, saveDb } from '../db/database.js';

export class OrderItemRepository {
  constructor(db) {
    this.db = db;
  }

  create({ id, orderId, menuId, nameKo, nameEn, quantity, price }) {
    const stmt = createStatement(this.db, `
      INSERT INTO order_items (id, order_id, menu_id, name_ko, name_en, quantity, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, orderId, menuId, nameKo, nameEn, quantity, price);
    return this.findById(id);
  }

  findById(id) {
    const stmt = createStatement(this.db, 'SELECT * FROM order_items WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.#mapRow(row) : null;
  }

  findByOrderId(orderId) {
    const stmt = createStatement(this.db, 'SELECT * FROM order_items WHERE order_id = ?');
    return stmt.all(orderId).map(row => this.#mapRow(row));
  }

  #mapRow(row) {
    return {
      id: row.id,
      orderId: row.order_id,
      menuId: row.menu_id,
      nameKo: row.name_ko,
      nameEn: row.name_en,
      quantity: row.quantity,
      price: row.price
    };
  }
}
