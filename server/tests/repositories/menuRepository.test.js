import { getTestDb } from '../setup.js';
import { MenuRepository } from '../../src/repositories/menuRepository.js';

describe('MenuRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    db.exec(`INSERT INTO categories (id, store_id, name) VALUES ('cat-001', 'store-001', 'Main')`);
    repo = new MenuRepository(db);
  });

  describe('create', () => {
    it('should create menu', () => {
      const menu = repo.create({
        id: 'menu-001', categoryId: 'cat-001', nameKo: '불고기', nameEn: 'Bulgogi',
        descKo: '설명', descEn: 'desc', price: 15000, imageUrl: null
      });
      expect(menu.nameKo).toBe('불고기');
      expect(menu.price).toBe(15000);
    });
  });

  describe('findByCategoryId', () => {
    it('should return menus ordered by sortOrder', () => {
      repo.create({ id: 'menu-001', categoryId: 'cat-001', nameKo: 'B', nameEn: 'B', price: 10000, sortOrder: 2 });
      repo.create({ id: 'menu-002', categoryId: 'cat-001', nameKo: 'A', nameEn: 'A', price: 10000, sortOrder: 1 });
      const menus = repo.findByCategoryId('cat-001');
      expect(menus[0].nameKo).toBe('A');
    });
  });

  describe('countByCategoryId', () => {
    it('should return menu count', () => {
      repo.create({ id: 'menu-001', categoryId: 'cat-001', nameKo: 'A', nameEn: 'A', price: 10000 });
      expect(repo.countByCategoryId('cat-001')).toBe(1);
    });
  });

  describe('update', () => {
    it('should update menu', () => {
      repo.create({ id: 'menu-001', categoryId: 'cat-001', nameKo: 'Old', nameEn: 'Old', price: 10000 });
      repo.update('menu-001', { nameKo: 'New', nameEn: 'New', price: 20000 });
      const menu = repo.findById('menu-001');
      expect(menu.nameKo).toBe('New');
      expect(menu.price).toBe(20000);
    });
  });

  describe('delete', () => {
    it('should delete menu', () => {
      repo.create({ id: 'menu-001', categoryId: 'cat-001', nameKo: 'A', nameEn: 'A', price: 10000 });
      repo.delete('menu-001');
      expect(repo.findById('menu-001')).toBeNull();
    });
  });
});
