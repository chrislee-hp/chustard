const { getTestDb } = require('../../src/db');
const TableService = require('../../src/services/TableService');
const TableRepository = require('../../src/repositories/TableRepository');
const OrderRepository = require('../../src/repositories/OrderRepository');
const OrderHistoryRepository = require('../../src/repositories/OrderHistoryRepository');
const SSEService = require('../../src/sse/SSEService');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

describe('TableService', () => {
  let db, service, sseService, storeId;

  beforeEach(() => {
    db = getTestDb();
    sseService = new SSEService();
    sseService.broadcast = jest.fn();
    service = new TableService(new TableRepository(db), new OrderRepository(db), new OrderHistoryRepository(db), sseService);
    storeId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Store');
  });

  afterEach(() => db.close());

  test('TC-S-022: createTable - 테이블 생성', () => {
    const result = service.createTable(storeId, 1, '1234');
    expect(result.tableNumber).toBe(1);
    expect(result.status).toBe('inactive');
  });

  test('TC-S-023: createTable - 중복 번호 VALIDATION_ERROR', () => {
    service.createTable(storeId, 1, '1234');
    expect(() => service.createTable(storeId, 1, '5678')).toThrow('VALIDATION_ERROR');
  });

  test('completeTable - 존재하지 않는 테이블 → NOT_FOUND', () => {
    expect(() => service.completeTable('nonexistent')).toThrow('NOT_FOUND');
  });

  test('TC-S-024: completeTable - 주문→이력 이동 + 세션 리셋 + SSE', () => {
    const table = service.createTable(storeId, 1, '1234');
    const sessionId = uuidv4();
    db.prepare('UPDATE tables SET currentSessionId = ?, status = ? WHERE id = ?').run(sessionId, 'active', table.id);
    const catId = uuidv4(); const menuId = uuidv4();
    db.prepare('INSERT INTO categories (id, storeId, name) VALUES (?, ?, ?)').run(catId, storeId, 'Cat');
    db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price) VALUES (?, ?, ?, ?, ?)').run(menuId, catId, 'A', 'A', 5000);
    const orderRepo = new (require('../../src/repositories/OrderRepository'))(db);
    orderRepo.create({ tableId: table.id, sessionId, totalAmount: 5000 }, [{ menuId, nameKo: 'A', nameEn: 'A', price: 5000, quantity: 1 }]);

    service.completeTable(table.id);

    const t = db.prepare('SELECT * FROM tables WHERE id = ?').get(table.id);
    expect(t.status).toBe('inactive');
    expect(t.currentSessionId).toBeNull();
    const history = db.prepare('SELECT * FROM order_history WHERE storeId = ?').all(storeId);
    expect(history).toHaveLength(1);
    expect(sseService.broadcast).toHaveBeenCalledWith('table:completed', expect.objectContaining({ tableId: table.id }), storeId, table.id);
  });
});
