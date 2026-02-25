import { getTestDb } from '../setup.js';
import { TableRepository } from '../../src/repositories/tableRepository.js';

describe('TableRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    repo = new TableRepository(db);
  });

  describe('create', () => {
    it('should create table', () => {
      const table = repo.create({ id: 'table-001', storeId: 'store-001', tableNumber: 1, password: '1234' });
      expect(table.tableNumber).toBe(1);
      expect(table.status).toBe('inactive');
    });
  });

  describe('findByStoreAndNumber', () => {
    it('should find table', () => {
      repo.create({ id: 'table-001', storeId: 'store-001', tableNumber: 1, password: '1234' });
      const table = repo.findByStoreAndNumber('store-001', 1);
      expect(table).not.toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update current session', () => {
      repo.create({ id: 'table-001', storeId: 'store-001', tableNumber: 1, password: '1234' });
      repo.updateSession('table-001', 'session-001', 'active');
      const table = repo.findById('table-001');
      expect(table.currentSessionId).toBe('session-001');
      expect(table.status).toBe('active');
    });
  });

  describe('findByStoreId', () => {
    it('should return all tables for store', () => {
      repo.create({ id: 'table-001', storeId: 'store-001', tableNumber: 1, password: '1234' });
      repo.create({ id: 'table-002', storeId: 'store-001', tableNumber: 2, password: '5678' });
      const tables = repo.findByStoreId('store-001');
      expect(tables).toHaveLength(2);
    });
  });
});
