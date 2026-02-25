const { getTestDb } = require('../../src/db');
const MenuService = require('../../src/services/MenuService');
const MenuRepository = require('../../src/repositories/MenuRepository');
const CategoryRepository = require('../../src/repositories/CategoryRepository');
const { v4: uuidv4 } = require('uuid');

describe('MenuService', () => {
  let db, service, storeId, catId;

  beforeEach(() => {
    db = getTestDb();
    service = new MenuService(new MenuRepository(db), new CategoryRepository(db));
    storeId = uuidv4(); catId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Store');
    db.prepare('INSERT INTO categories (id, storeId, name, sortOrder) VALUES (?, ?, ?, ?)').run(catId, storeId, 'Main', 0);
  });

  afterEach(() => db.close());

  test('TC-S-010: getMenus - 카테고리별 그룹화 반환', () => {
    db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), catId, 'A', 'A', 1000);
    const result = service.getMenus(storeId);
    expect(result).toHaveLength(1);
    expect(result[0].menus).toHaveLength(1);
  });

  test('TC-S-011: createMenu - 메뉴 생성 + sortOrder 자동 할당', () => {
    const m1 = service.createMenu({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    const m2 = service.createMenu({ categoryId: catId, nameKo: 'B', nameEn: 'B', price: 2000 });
    expect(m2.sortOrder).toBeGreaterThan(m1.sortOrder);
  });

  test('TC-S-012: deleteCategory - 하위 메뉴 있으면 VALIDATION_ERROR', () => {
    db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), catId, 'A', 'A', 1000);
    expect(() => service.deleteCategory(catId)).toThrow('VALIDATION_ERROR');
  });

  test('TC-S-013: deleteCategory - 하위 메뉴 없으면 삭제 성공', () => {
    service.deleteCategory(catId);
    const cats = service.getMenus(storeId);
    expect(cats).toHaveLength(0);
  });

  test('TC-S-014: reorderMenus - sortOrder 재할당', () => {
    const m1 = service.createMenu({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    const m2 = service.createMenu({ categoryId: catId, nameKo: 'B', nameEn: 'B', price: 2000 });
    service.reorderMenus([m2.id, m1.id]);
    const menus = service.getMenus(storeId)[0].menus;
    expect(menus[0].id).toBe(m2.id);
  });

  test('createCategory - 카테고리 생성', () => {
    const cat = service.createCategory(storeId, '음료');
    expect(cat.name).toBe('음료');
    expect(cat.storeId).toBe(storeId);
  });

  test('updateMenu - 존재하지 않는 메뉴 → NOT_FOUND', () => {
    expect(() => service.updateMenu('nonexistent', { nameKo: 'X' })).toThrow('NOT_FOUND');
  });

  test('deleteMenu - 존재하지 않는 메뉴 → NOT_FOUND', () => {
    expect(() => service.deleteMenu('nonexistent')).toThrow('NOT_FOUND');
  });

  test('updateCategory - 존재하지 않는 카테고리 → NOT_FOUND', () => {
    expect(() => service.updateCategory('nonexistent', 'X')).toThrow('NOT_FOUND');
  });

  test('updateMenu - 정상 수정', () => {
    const m = service.createMenu({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    const updated = service.updateMenu(m.id, { nameKo: 'B', price: 2000 });
    expect(updated.nameKo).toBe('B');
    expect(updated.price).toBe(2000);
  });

  test('deleteMenu - 정상 삭제', () => {
    const m = service.createMenu({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    service.deleteMenu(m.id);
    const menus = service.getMenus(storeId)[0].menus;
    expect(menus).toHaveLength(0);
  });

  test('reorderCategories - sortOrder 재할당', () => {
    const cat2 = service.createCategory(storeId, '음료');
    service.reorderCategories([cat2.id, catId]);
    const cats = service.getMenus(storeId);
    expect(cats[0].id).toBe(cat2.id);
  });
});
