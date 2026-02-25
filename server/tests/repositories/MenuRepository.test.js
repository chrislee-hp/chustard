const { getTestDb } = require('../../src/db');
const MenuRepository = require('../../src/repositories/MenuRepository');
const { v4: uuidv4 } = require('uuid');

describe('MenuRepository', () => {
  let db, repo, storeId, catId;

  beforeEach(() => {
    db = getTestDb();
    repo = new MenuRepository(db);
    storeId = uuidv4();
    catId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Test Store');
    db.prepare('INSERT INTO categories (id, storeId, name, sortOrder) VALUES (?, ?, ?, ?)').run(catId, storeId, 'Main', 0);
  });

  afterEach(() => db.close());

  test('TC-R-013: create - 메뉴 생성', () => {
    const result = repo.create({ categoryId: catId, nameKo: '김치찌개', nameEn: 'Kimchi Stew', price: 9000 });
    expect(result.id).toBeDefined();
    expect(result.nameKo).toBe('김치찌개');
  });

  test('TC-R-014: findAllByStoreGrouped - 카테고리별 그룹화 반환', () => {
    repo.create({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    const result = repo.findAllByStoreGrouped(storeId);
    expect(result).toHaveLength(1);
    expect(result[0].menus).toHaveLength(1);
  });

  test('TC-R-015: update - 메뉴 수정', () => {
    const m = repo.create({ categoryId: catId, nameKo: 'Old', nameEn: 'Old', price: 1000 });
    const updated = repo.update(m.id, { nameKo: 'New', nameEn: 'New', price: 2000 });
    expect(updated.nameKo).toBe('New');
    expect(updated.price).toBe(2000);
  });

  test('TC-R-016: delete - 메뉴 삭제', () => {
    const m = repo.create({ categoryId: catId, nameKo: 'Del', nameEn: 'Del', price: 1000 });
    repo.delete(m.id);
    expect(repo.findById(m.id)).toBeNull();
  });

  test('TC-R-017: updateSortOrders - 메뉴 순서 변경', () => {
    const m1 = repo.create({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    const m2 = repo.create({ categoryId: catId, nameKo: 'B', nameEn: 'B', price: 2000 });
    repo.updateSortOrders([[m2.id, 0], [m1.id, 1]]);
    const all = repo.findAllByStoreGrouped(storeId);
    expect(all[0].menus[0].id).toBe(m2.id);
  });

  test('update - 일부 필드만 수정 시 나머지 유지', () => {
    const m = repo.create({ categoryId: catId, nameKo: 'Original', nameEn: 'Orig', price: 1000, descKo: '설명', imageUrl: 'img.jpg' });
    const updated = repo.update(m.id, { nameKo: 'Changed' });
    expect(updated.nameKo).toBe('Changed');
    expect(updated.nameEn).toBe('Orig');
    expect(updated.price).toBe(1000);
  });

  test('maxSortOrder - 메뉴 없으면 -1', () => {
    expect(repo.maxSortOrder(catId)).toBe(-1);
  });

  test('maxSortOrder - 메뉴 있으면 최대값', () => {
    repo.create({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000, sortOrder: 5 });
    expect(repo.maxSortOrder(catId)).toBe(5);
  });

  test('findById - 없으면 null', () => {
    expect(repo.findById('nonexistent')).toBeNull();
  });
});
