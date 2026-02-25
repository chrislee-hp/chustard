import { getTestDb } from '../setup.js';
import { OrderRepository } from '../../src/repositories/orderRepository.js';

describe('OrderRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    db.exec(`INSERT INTO tables (id, store_id, table_number, password) VALUES ('table-001', 'store-001', 1, '1234')`);
    db.exec(`INSERT INTO table_sessions (id, table_id) VALUES ('session-001', 'table-001')`);
    repo = new OrderRepository(db);
  });

  describe('create', () => {
    it('should create order with auto-increment id', () => {
      const order = repo.create({ sessionId: 'session-001', tableId: 'table-001', totalAmount: 10000 });
      expect(order.id).toBe(1);
      expect(order.status).toBe('pending');
    });
  });

  describe('findBySessionId', () => {
    it('should return orders excluding deleted', () => {
      repo.create({ sessionId: 'session-001', tableId: 'table-001', totalAmount: 10000 });
      repo.create({ sessionId: 'session-001', tableId: 'table-001', totalAmount: 20000 });
      const orders = repo.findBySessionId('session-001');
      expect(orders).toHaveLength(2);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', () => {
      const order = repo.create({ sessionId: 'session-001', tableId: 'table-001', totalAmount: 10000 });
      repo.updateStatus(order.id, 'preparing');
      const updated = repo.findById(order.id);
      expect(updated.status).toBe('preparing');
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt', () => {
      const order = repo.create({ sessionId: 'session-001', tableId: 'table-001', totalAmount: 10000 });
      repo.softDelete(order.id);
      const orders = repo.findBySessionId('session-001');
      expect(orders).toHaveLength(0);
    });
  });
});
