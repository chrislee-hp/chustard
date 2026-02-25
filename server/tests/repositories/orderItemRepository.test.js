import { getTestDb } from '../setup.js';
import { OrderItemRepository } from '../../src/repositories/orderItemRepository.js';

describe('OrderItemRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    db.exec(`INSERT INTO tables (id, store_id, table_number, password) VALUES ('table-001', 'store-001', 1, '1234')`);
    db.exec(`INSERT INTO table_sessions (id, table_id) VALUES ('session-001', 'table-001')`);
    db.exec(`INSERT INTO orders (session_id, table_id, total_amount, status) VALUES ('session-001', 'table-001', 10000, 'pending')`);
    repo = new OrderItemRepository(db);
  });

  describe('create', () => {
    it('should create order item', () => {
      const item = repo.create({
        id: 'item-001', orderId: 1, menuId: 'menu-001',
        nameKo: '불고기', nameEn: 'Bulgogi', quantity: 2, price: 15000
      });
      expect(item.quantity).toBe(2);
    });
  });

  describe('findByOrderId', () => {
    it('should return items for order', () => {
      repo.create({ id: 'item-001', orderId: 1, menuId: 'menu-001', nameKo: 'A', nameEn: 'A', quantity: 1, price: 10000 });
      repo.create({ id: 'item-002', orderId: 1, menuId: 'menu-002', nameKo: 'B', nameEn: 'B', quantity: 2, price: 5000 });
      const items = repo.findByOrderId(1);
      expect(items).toHaveLength(2);
    });
  });
});
