import { getTestDb } from '../setup.js';
import { AdminRepository } from '../../src/repositories/adminRepository.js';

describe('AdminRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    repo = new AdminRepository(db);
  });

  describe('create', () => {
    it('should create admin', () => {
      const admin = repo.create({ id: 'admin-001', storeId: 'store-001', username: 'admin', passwordHash: 'hash' });
      expect(admin.id).toBe('admin-001');
      expect(admin.username).toBe('admin');
    });
  });

  describe('findByStoreAndUsername', () => {
    it('should find admin by store and username', () => {
      repo.create({ id: 'admin-001', storeId: 'store-001', username: 'admin', passwordHash: 'hash' });
      const admin = repo.findByStoreAndUsername('store-001', 'admin');
      expect(admin).not.toBeNull();
      expect(admin.username).toBe('admin');
    });

    it('should return null if not found', () => {
      const admin = repo.findByStoreAndUsername('store-001', 'nonexistent');
      expect(admin).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find admin by id', () => {
      repo.create({ id: 'admin-001', storeId: 'store-001', username: 'admin', passwordHash: 'hash' });
      const admin = repo.findById('admin-001');
      expect(admin.id).toBe('admin-001');
    });
  });
});
