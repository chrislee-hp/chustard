const { getTestDb } = require('../../src/db');
const CategoryRepository = require('../../src/repositories/CategoryRepository');
const { v4: uuidv4 } = require('uuid');

describe('CategoryRepository', () => {
  let db, repo, storeId;

  beforeEach(() => {
    db = getTestDb();
    repo = new CategoryRepository(db);
    storeId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Test Store');
  });

  afterEach(() => db.close());

  test('TC-R-007: create - 카테고리 생성', () => {
    const result = repo.create({ storeId, name: '메인' });
    expect(result.id).toBeDefined();
    expect(result.name).toBe('메인');
  });

  test('TC-R-008: findAllByStore - 정렬 순서대로 반환', () => {
    repo.create({ storeId, name: 'B', sortOrder: 1 });
    repo.create({ storeId, name: 'A', sortOrder: 0 });
    const result = repo.findAllByStore(storeId);
    expect(result[0].name).toBe('A');
    expect(result[1].name).toBe('B');
  });

  test('TC-R-009: update - 카테고리명 수정', () => {
    const cat = repo.create({ storeId, name: 'Old' });
    const updated = repo.update(cat.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });

  test('TC-R-010: delete - 카테고리 삭제', () => {
    const cat = repo.create({ storeId, name: 'Del' });
    repo.delete(cat.id);
    expect(repo.findById(cat.id)).toBeNull();
  });

  test('TC-R-011: updateSortOrders - 순서 일괄 변경', () => {
    const c1 = repo.create({ storeId, name: 'A' });
    const c2 = repo.create({ storeId, name: 'B' });
    repo.updateSortOrders([[c2.id, 0], [c1.id, 1]]);
    const all = repo.findAllByStore(storeId);
    expect(all[0].id).toBe(c2.id);
  });

  test('TC-R-012: countMenus - 하위 메뉴 수 반환', () => {
    const cat = repo.create({ storeId, name: 'Cat' });
    db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), cat.id, '메뉴1', 'Menu1', 10000);
    expect(repo.countMenus(cat.id)).toBe(1);
  });
});
