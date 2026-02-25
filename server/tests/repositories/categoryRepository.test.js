import { getTestDb } from '../setup.js';
import { CategoryRepository } from '../../src/repositories/categoryRepository.js';

describe('CategoryRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    repo = new CategoryRepository(db);
  });

  describe('create', () => {
    it('should create category', () => {
      const cat = repo.create({ id: 'cat-001', storeId: 'store-001', name: 'Main' });
      expect(cat.name).toBe('Main');
    });
  });

  describe('findByStoreId', () => {
    it('should return categories ordered by sortOrder', () => {
      repo.create({ id: 'cat-001', storeId: 'store-001', name: 'B', sortOrder: 2 });
      repo.create({ id: 'cat-002', storeId: 'store-001', name: 'A', sortOrder: 1 });
      const cats = repo.findByStoreId('store-001');
      expect(cats[0].name).toBe('A');
    });
  });

  describe('update', () => {
    it('should update category name', () => {
      repo.create({ id: 'cat-001', storeId: 'store-001', name: 'Old' });
      repo.update('cat-001', { name: 'New' });
      const cat = repo.findById('cat-001');
      expect(cat.name).toBe('New');
    });
  });

  describe('delete', () => {
    it('should delete category', () => {
      repo.create({ id: 'cat-001', storeId: 'store-001', name: 'Test' });
      repo.delete('cat-001');
      expect(repo.findById('cat-001')).toBeNull();
    });
  });

  describe('reorder', () => {
    it('should update sort orders', () => {
      repo.create({ id: 'cat-001', storeId: 'store-001', name: 'A', sortOrder: 1 });
      repo.create({ id: 'cat-002', storeId: 'store-001', name: 'B', sortOrder: 2 });
      repo.reorder(['cat-002', 'cat-001']);
      const cats = repo.findByStoreId('store-001');
      expect(cats[0].id).toBe('cat-002');
    });
  });
});
