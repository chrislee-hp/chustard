const { getTestDb } = require('../../src/db');
const OrderService = require('../../src/services/OrderService');
const OrderRepository = require('../../src/repositories/OrderRepository');
const TableRepository = require('../../src/repositories/TableRepository');
const MenuRepository = require('../../src/repositories/MenuRepository');
const SSEService = require('../../src/sse/SSEService');
const { v4: uuidv4 } = require('uuid');

describe('OrderService', () => {
  let db, service, sseService, storeId, tableId, sessionId, menuId;

  beforeEach(() => {
    db = getTestDb();
    sseService = new SSEService();
    sseService.broadcast = jest.fn();
    service = new OrderService(new OrderRepository(db), new TableRepository(db), new MenuRepository(db), sseService);
    storeId = uuidv4(); tableId = uuidv4(); sessionId = uuidv4(); menuId = uuidv4();
    const catId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Store');
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash, status, currentSessionId) VALUES (?, ?, ?, ?, ?, ?)').run(tableId, storeId, 1, 'h', 'active', sessionId);
    db.prepare('INSERT INTO categories (id, storeId, name) VALUES (?, ?, ?)').run(catId, storeId, 'Cat');
    db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price) VALUES (?, ?, ?, ?, ?)').run(menuId, catId, '김치찌개', 'Kimchi Stew', 9000);
  });

  afterEach(() => db.close());

  test('TC-S-015: createOrder - 주문 생성 + 메뉴 스냅샷 복사', () => {
    const order = service.createOrder(tableId, sessionId, [{ menuId, quantity: 2, price: 9000 }]);
    expect(order.totalAmount).toBe(18000);
    expect(order.items[0].nameKo).toBe('김치찌개');
  });

  test('TC-S-016: createOrder - 테이블 inactive→active 전환', () => {
    db.prepare('UPDATE tables SET status = ? WHERE id = ?').run('inactive', tableId);
    service.createOrder(tableId, sessionId, [{ menuId, quantity: 1, price: 9000 }]);
    const table = db.prepare('SELECT status FROM tables WHERE id = ?').get(tableId);
    expect(table.status).toBe('active');
  });

  test('TC-S-017: createOrder - SSE order:created 발행', () => {
    service.createOrder(tableId, sessionId, [{ menuId, quantity: 1, price: 9000 }]);
    expect(sseService.broadcast).toHaveBeenCalledWith('order:created', expect.any(Object), storeId, tableId);
  });

  test('TC-S-018: updateOrderStatus - pending→preparing 성공', () => {
    const order = service.createOrder(tableId, sessionId, [{ menuId, quantity: 1, price: 9000 }]);
    const updated = service.updateOrderStatus(order.id, 'preparing');
    expect(updated.status).toBe('preparing');
  });

  test('TC-S-019: updateOrderStatus - pending→completed 거부', () => {
    const order = service.createOrder(tableId, sessionId, [{ menuId, quantity: 1, price: 9000 }]);
    expect(() => service.updateOrderStatus(order.id, 'completed')).toThrow('VALIDATION_ERROR');
  });

  test('TC-S-020: updateOrderStatus - SSE order:status-changed 발행', () => {
    const order = service.createOrder(tableId, sessionId, [{ menuId, quantity: 1, price: 9000 }]);
    sseService.broadcast.mockClear();
    service.updateOrderStatus(order.id, 'preparing');
    expect(sseService.broadcast).toHaveBeenCalledWith('order:status-changed', expect.objectContaining({ orderId: order.id, status: 'preparing' }), storeId, tableId);
  });

  test('createOrder - 존재하지 않는 테이블 → VALIDATION_ERROR', () => {
    expect(() => service.createOrder('nonexistent', sessionId, [{ menuId, quantity: 1 }])).toThrow('VALIDATION_ERROR');
  });

  test('createOrder - 존재하지 않는 메뉴 → VALIDATION_ERROR', () => {
    expect(() => service.createOrder(tableId, sessionId, [{ menuId: 'bad', quantity: 1 }])).toThrow('VALIDATION_ERROR');
  });

  test('updateOrderStatus - 존재하지 않는 주문 → NOT_FOUND', () => {
    expect(() => service.updateOrderStatus('nonexistent', 'preparing')).toThrow('NOT_FOUND');
  });

  test('deleteOrder - 존재하지 않는 주문 → NOT_FOUND', () => {
    expect(() => service.deleteOrder('nonexistent')).toThrow('NOT_FOUND');
  });

  test('getOrderHistory - orderHistoryRepo 연동', () => {
    const OrderHistoryRepository = require('../../src/repositories/OrderHistoryRepository');
    const svc = new OrderService(new (require('../../src/repositories/OrderRepository'))(db), new (require('../../src/repositories/TableRepository'))(db), new (require('../../src/repositories/MenuRepository'))(db), sseService, new OrderHistoryRepository(db));
    const result = svc.getOrderHistory(storeId, null, null);
    expect(Array.isArray(result)).toBe(true);
  });

  test('TC-S-021: deleteOrder - 소프트 삭제 + SSE 발행', () => {
    const order = service.createOrder(tableId, sessionId, [{ menuId, quantity: 1, price: 9000 }]);
    sseService.broadcast.mockClear();
    service.deleteOrder(order.id);
    const deleted = db.prepare('SELECT isDeleted FROM orders WHERE id = ?').get(order.id);
    expect(deleted.isDeleted).toBe(1);
    expect(sseService.broadcast).toHaveBeenCalledWith('order:deleted', expect.objectContaining({ orderId: order.id }), storeId, tableId);
  });
});
