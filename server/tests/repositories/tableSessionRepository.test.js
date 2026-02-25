import { getTestDb } from '../setup.js';
import { TableSessionRepository } from '../../src/repositories/tableSessionRepository.js';

describe('TableSessionRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    db.exec(`INSERT INTO tables (id, store_id, table_number, password) VALUES ('table-001', 'store-001', 1, '1234')`);
    repo = new TableSessionRepository(db);
  });

  describe('create', () => {
    it('should create session', () => {
      const session = repo.create({ id: 'session-001', tableId: 'table-001' });
      expect(session.tableId).toBe('table-001');
      expect(session.endedAt).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find session', () => {
      repo.create({ id: 'session-001', tableId: 'table-001' });
      const session = repo.findById('session-001');
      expect(session).not.toBeNull();
    });
  });

  describe('endSession', () => {
    it('should set endedAt', () => {
      repo.create({ id: 'session-001', tableId: 'table-001' });
      repo.endSession('session-001');
      const session = repo.findById('session-001');
      expect(session.endedAt).not.toBeNull();
    });
  });
});
