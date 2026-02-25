const { getTestDb } = require('../../src/db');
const OrderRepository = require('../../src/repositories/OrderRepository');
const { v4: uuidv4 } = require('uuid');

describe('OrderRepository', () => {
  let db, repo, storeId, tableId, sessionId, menuId;

  beforeEach(() => {
    db = getTestDb();
    repo = new OrderRepository(db);
    storeId = uuidv4(); tableId = uuidv4(); sessionId = uuidv4(); menuId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Store');
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash, status, currentSessionId) VALUES (?, ?, ?, ?, ?, ?)').run(tableId, storeId, 1, 'h', 'active', sessionId);
    db.prepare('INSERT INTO categories (id, storeId, name) VALUES (?, ?, ?)').run(uuidv4(), storeId, 'Cat');
  });

  afterEach(() => db.close());

  test('TC-R-018: create - 주문+항목 생성', () => {
    const order = repo.create(
      { tableId, sessionId, totalAmount: 20000 },
      [{ menuId, nameKo: '김치찌개', nameEn: 'Kimchi', price: 10000, quantity: 2 }]
    );
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    expect(items).toHaveLength(1);
  });

  test('TC-R-019: findByTableSession - 세션별 주문 조회 (삭제 제외)', () => {
    const o1 = repo.create({ tableId, sessionId, totalAmount: 1000 }, [{ menuId, nameKo: 'A', nameEn: 'A', price: 1000, quantity: 1 }]);
    const o2 = repo.create({ tableId, sessionId, totalAmount: 2000 }, [{ menuId, nameKo: 'B', nameEn: 'B', price: 2000, quantity: 1 }]);
    repo.softDelete(o2.id);
    const result = repo.findByTableSession(tableId, sessionId);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(o1.id);
  });

  test('TC-R-020: findAllByStore - 테이블별 그룹화 조회', () => {
    repo.create({ tableId, sessionId, totalAmount: 5000 }, [{ menuId, nameKo: 'A', nameEn: 'A', price: 5000, quantity: 1 }]);
    const result = repo.findAllByStore(storeId);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].tableId).toBe(tableId);
  });

  test('TC-R-021: updateStatus - 상태 변경', () => {
    const o = repo.create({ tableId, sessionId, totalAmount: 1000 }, [{ menuId, nameKo: 'A', nameEn: 'A', price: 1000, quantity: 1 }]);
    repo.updateStatus(o.id, 'preparing');
    const updated = repo.findById(o.id);
    expect(updated.status).toBe('preparing');
  });

  test('TC-R-022: softDelete - isDeleted=1 처리', () => {
    const o = repo.create({ tableId, sessionId, totalAmount: 1000 }, [{ menuId, nameKo: 'A', nameEn: 'A', price: 1000, quantity: 1 }]);
    repo.softDelete(o.id);
    const deleted = repo.findById(o.id);
    expect(deleted.isDeleted).toBe(1);
  });

  test('TC-R-023: deleteBySession - 세션 주문 hard delete', () => {
    repo.create({ tableId, sessionId, totalAmount: 1000 }, [{ menuId, nameKo: 'A', nameEn: 'A', price: 1000, quantity: 1 }]);
    repo.deleteBySession(tableId, sessionId);
    const result = db.prepare('SELECT * FROM orders WHERE tableId = ? AND sessionId = ?').all(tableId, sessionId);
    expect(result).toHaveLength(0);
  });
});
