const { getTestDb } = require('../../src/db');
const OrderHistoryRepository = require('../../src/repositories/OrderHistoryRepository');
const { v4: uuidv4 } = require('uuid');

describe('OrderHistoryRepository', () => {
  let db, repo, storeId;

  beforeEach(() => {
    db = getTestDb();
    repo = new OrderHistoryRepository(db);
    storeId = uuidv4();
  });

  afterEach(() => db.close());

  test('TC-R-024: create - 이력 저장', () => {
    const result = repo.create({ storeId, tableNumber: 1, sessionId: 's1', ordersJson: '[]', totalAmount: 5000 });
    expect(result.id).toBeDefined();
  });

  test('TC-R-025: findByFilters - 필터 조회', () => {
    repo.create({ storeId, tableNumber: 1, sessionId: 's1', ordersJson: '[]', totalAmount: 5000 });
    repo.create({ storeId, tableNumber: 2, sessionId: 's2', ordersJson: '[]', totalAmount: 3000 });
    const all = repo.findByFilters(storeId);
    expect(all).toHaveLength(2);
  });

  test('findByFilters - tableId 필터', () => {
    const tableId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'S');
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash) VALUES (?, ?, ?, ?)').run(tableId, storeId, 1, 'h');
    repo.create({ storeId, tableNumber: 1, sessionId: 's1', ordersJson: '[]', totalAmount: 5000 });
    repo.create({ storeId, tableNumber: 2, sessionId: 's2', ordersJson: '[]', totalAmount: 3000 });
    const filtered = repo.findByFilters(storeId, tableId);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].tableNumber).toBe(1);
  });

  test('findByFilters - date 필터', () => {
    repo.create({ storeId, tableNumber: 1, sessionId: 's1', ordersJson: '[]', totalAmount: 5000 });
    const today = new Date().toISOString().split('T')[0];
    const filtered = repo.findByFilters(storeId, null, today);
    expect(filtered).toHaveLength(1);
    const none = repo.findByFilters(storeId, null, '2020-01-01');
    expect(none).toHaveLength(0);
  });
});
