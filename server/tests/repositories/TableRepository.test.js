const { getTestDb } = require('../../src/db');
const TableRepository = require('../../src/repositories/TableRepository');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

describe('TableRepository', () => {
  let db, repo, storeId;

  beforeEach(() => {
    db = getTestDb();
    repo = new TableRepository(db);
    storeId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Test Store');
  });

  afterEach(() => db.close());

  test('TC-R-003: create - 테이블 생성', () => {
    const result = repo.create({ storeId, tableNumber: 1, passwordHash: bcrypt.hashSync('1234', 10) });
    expect(result.id).toBeDefined();
    expect(result.tableNumber).toBe(1);
    expect(result.status).toBe('inactive');
  });

  test('TC-R-004: findByStoreAndNumber - 존재하는 테이블 반환', () => {
    repo.create({ storeId, tableNumber: 3, passwordHash: 'hash' });
    const result = repo.findByStoreAndNumber(storeId, 3);
    expect(result).not.toBeNull();
    expect(result.tableNumber).toBe(3);
  });

  test('TC-R-005: findAllByStore - 매장 전체 테이블 목록', () => {
    repo.create({ storeId, tableNumber: 1, passwordHash: 'h' });
    repo.create({ storeId, tableNumber: 2, passwordHash: 'h' });
    const result = repo.findAllByStore(storeId);
    expect(result).toHaveLength(2);
  });

  test('TC-R-006: updateSession - 세션 ID/상태 업데이트', () => {
    const t = repo.create({ storeId, tableNumber: 1, passwordHash: 'h' });
    repo.updateSession(t.id, 'session-1', 'active');
    const updated = repo.findById(t.id);
    expect(updated.currentSessionId).toBe('session-1');
    expect(updated.status).toBe('active');
  });
});
