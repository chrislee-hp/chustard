const { getTestDb } = require('../../src/db');
const { createApp } = require('../../src/app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../../src/middleware/auth');

describe('API Routes', () => {
  let db, app, storeId, adminToken, tableToken, tableId, sessionId, catId, menuId;

  beforeEach(() => {
    db = getTestDb();
    app = createApp(db);
    storeId = uuidv4();
    const adminId = uuidv4();
    tableId = uuidv4();
    sessionId = uuidv4();
    catId = uuidv4();
    menuId = uuidv4();

    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Store');
    db.prepare('INSERT INTO admins (id, storeId, username, passwordHash) VALUES (?, ?, ?, ?)').run(adminId, storeId, 'admin', bcrypt.hashSync('pass123', 10));
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash, status, currentSessionId) VALUES (?, ?, ?, ?, ?, ?)').run(tableId, storeId, 1, bcrypt.hashSync('1234', 10), 'active', sessionId);
    db.prepare('INSERT INTO categories (id, storeId, name, sortOrder) VALUES (?, ?, ?, ?)').run(catId, storeId, 'Main', 0);
    db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price) VALUES (?, ?, ?, ?, ?)').run(menuId, catId, '김치찌개', 'Kimchi Stew', 9000);

    adminToken = jwt.sign({ role: 'admin', storeId, adminId }, JWT_SECRET, { expiresIn: '16h' });
    tableToken = jwt.sign({ role: 'table', storeId, tableId, sessionId }, JWT_SECRET, { expiresIn: '16h' });
  });

  afterEach(() => db.close());

  // Auth
  test('TC-A-001: POST /api/admin/login - 200 성공', async () => {
    const res = await request(app).post('/api/admin/login').send({ storeId, username: 'admin', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('TC-A-002: POST /api/admin/login - 401 실패', async () => {
    const res = await request(app).post('/api/admin/login').send({ storeId, username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('TC-A-003: POST /api/table/login - 200 성공', async () => {
    const res = await request(app).post('/api/table/login').send({ storeId, tableNumber: 1, password: '1234' });
    expect(res.status).toBe(200);
    expect(res.body.tableId).toBe(tableId);
  });

  test('TC-A-004: GET /api/auth/verify - 200 유효 토큰', async () => {
    const res = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  test('TC-A-005: GET /api/auth/verify - 401 만료 토큰', async () => {
    const expired = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '0s' });
    const res = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  // Menu
  test('TC-A-006: GET /api/menus - 200 메뉴 목록', async () => {
    const res = await request(app).get(`/api/menus?storeId=${storeId}`);
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(1);
  });

  test('TC-A-007: POST /api/admin/menus - 201 생성', async () => {
    const res = await request(app).post('/api/admin/menus').set('Authorization', `Bearer ${adminToken}`).send({ categoryId: catId, nameKo: '된장찌개', nameEn: 'Doenjang', price: 8000 });
    expect(res.status).toBe(201);
    expect(res.body.menu.nameKo).toBe('된장찌개');
  });

  test('TC-A-008: POST /api/admin/menus - 401 인증 없음', async () => {
    const res = await request(app).post('/api/admin/menus').send({ categoryId: catId, nameKo: 'A', nameEn: 'A', price: 1000 });
    expect(res.status).toBe(401);
  });

  test('TC-A-009: DELETE /api/admin/categories/:id - 400 하위 메뉴 존재', async () => {
    const res = await request(app).delete(`/api/admin/categories/${catId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  // Order
  test('TC-A-010: POST /api/orders - 201 주문 생성', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${tableToken}`).send({ tableId, sessionId, items: [{ menuId, quantity: 1, price: 9000 }] });
    expect(res.status).toBe(201);
    expect(res.body.order.totalAmount).toBe(9000);
  });

  test('TC-A-011: POST /api/orders - 401 인증 없음', async () => {
    const res = await request(app).post('/api/orders').send({ tableId, sessionId, items: [] });
    expect(res.status).toBe(401);
  });

  test('TC-A-012: GET /api/orders - 200 세션 주문 조회', async () => {
    await request(app).post('/api/orders').set('Authorization', `Bearer ${tableToken}`).send({ tableId, sessionId, items: [{ menuId, quantity: 1, price: 9000 }] });
    const res = await request(app).get(`/api/orders?tableId=${tableId}&sessionId=${sessionId}`).set('Authorization', `Bearer ${tableToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });

  test('TC-A-013: PUT /api/admin/orders/:id/status - 200 상태 변경', async () => {
    const createRes = await request(app).post('/api/orders').set('Authorization', `Bearer ${tableToken}`).send({ tableId, sessionId, items: [{ menuId, quantity: 1, price: 9000 }] });
    const res = await request(app).put(`/api/admin/orders/${createRes.body.order.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'preparing' });
    expect(res.status).toBe(200);
  });

  test('TC-A-014: PUT /api/admin/orders/:id/status - 400 잘못된 전이', async () => {
    const createRes = await request(app).post('/api/orders').set('Authorization', `Bearer ${tableToken}`).send({ tableId, sessionId, items: [{ menuId, quantity: 1, price: 9000 }] });
    const res = await request(app).put(`/api/admin/orders/${createRes.body.order.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'completed' });
    expect(res.status).toBe(400);
  });

  test('TC-A-015: DELETE /api/admin/orders/:id - 200 삭제', async () => {
    const createRes = await request(app).post('/api/orders').set('Authorization', `Bearer ${tableToken}`).send({ tableId, sessionId, items: [{ menuId, quantity: 1, price: 9000 }] });
    const res = await request(app).delete(`/api/admin/orders/${createRes.body.order.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  // Table
  test('TC-A-016: POST /api/admin/tables - 201 생성', async () => {
    const res = await request(app).post('/api/admin/tables').set('Authorization', `Bearer ${adminToken}`).send({ storeId, tableNumber: 99, password: '9999' });
    expect(res.status).toBe(201);
  });

  test('TC-A-017: POST /api/admin/tables/:id/complete - 200 이용 완료', async () => {
    const res = await request(app).post(`/api/admin/tables/${tableId}/complete`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  // Additional Route Tests
  test('PUT /api/admin/menus/:id - 200 수정', async () => {
    const res = await request(app).put(`/api/admin/menus/${menuId}`).set('Authorization', `Bearer ${adminToken}`).send({ nameKo: '된장찌개', price: 8000 });
    expect(res.status).toBe(200);
    expect(res.body.menu.nameKo).toBe('된장찌개');
  });

  test('PUT /api/admin/menus/:id - 404 미존재', async () => {
    const res = await request(app).put('/api/admin/menus/nonexistent').set('Authorization', `Bearer ${adminToken}`).send({ nameKo: 'X' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/admin/menus/:id - 200 삭제', async () => {
    const res = await request(app).delete(`/api/admin/menus/${menuId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('DELETE /api/admin/menus/:id - 404 미존재', async () => {
    const res = await request(app).delete('/api/admin/menus/nonexistent').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test('PUT /api/admin/menus/reorder - 200', async () => {
    const res = await request(app).put('/api/admin/menus/reorder').set('Authorization', `Bearer ${adminToken}`).send({ menuIds: [menuId] });
    expect(res.status).toBe(200);
  });

  test('GET /api/admin/tables - 200 목록', async () => {
    const res = await request(app).get(`/api/admin/tables?storeId=${storeId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.tables).toHaveLength(1);
  });

  test('GET /api/admin/orders/history - 200 내역', async () => {
    const res = await request(app).get(`/api/admin/orders/history`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  test('PUT /api/admin/categories/:id - 200 수정', async () => {
    const res = await request(app).put(`/api/admin/categories/${catId}`).set('Authorization', `Bearer ${adminToken}`).send({ name: '사이드' });
    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe('사이드');
  });

  test('PUT /api/admin/categories/:id - 404 미존재', async () => {
    const res = await request(app).put('/api/admin/categories/nonexistent').set('Authorization', `Bearer ${adminToken}`).send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/admin/categories/:id - 200 빈 카테고리 삭제', async () => {
    const emptyCatId = uuidv4();
    db.prepare('INSERT INTO categories (id, storeId, name) VALUES (?, ?, ?)').run(emptyCatId, storeId, 'Empty');
    const res = await request(app).delete(`/api/admin/categories/${emptyCatId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('PUT /api/admin/categories/reorder - 200', async () => {
    const res = await request(app).put('/api/admin/categories/reorder').set('Authorization', `Bearer ${adminToken}`).send({ categoryIds: [catId] });
    expect(res.status).toBe(200);
  });

  test('POST /api/admin/categories - 201 생성', async () => {
    const res = await request(app).post('/api/admin/categories').set('Authorization', `Bearer ${adminToken}`).send({ name: '음료' });
    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe('음료');
  });

  test('POST /api/orders - 403 admin 토큰으로 주문 불가', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${adminToken}`).send({ tableId, sessionId, items: [{ menuId, quantity: 1 }] });
    expect(res.status).toBe(403);
  });

  test('POST /api/orders - 400 잘못된 메뉴', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${tableToken}`).send({ tableId, sessionId, items: [{ menuId: 'bad', quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  test('PUT /api/admin/orders/:id/status - 404 미존재 주문', async () => {
    const res = await request(app).put('/api/admin/orders/nonexistent/status').set('Authorization', `Bearer ${adminToken}`).send({ status: 'preparing' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/admin/orders/:id - 404 미존재 주문', async () => {
    const res = await request(app).delete('/api/admin/orders/nonexistent').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/admin/tables - 400 중복 테이블', async () => {
    const res = await request(app).post('/api/admin/tables').set('Authorization', `Bearer ${adminToken}`).send({ storeId, tableNumber: 1, password: '1234' });
    expect(res.status).toBe(400);
  });

  test('POST /api/admin/tables/:id/complete - 404 미존재', async () => {
    const res = await request(app).post('/api/admin/tables/nonexistent/complete').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/admin/orders - 200 주문 목록', async () => {
    const res = await request(app).get(`/api/admin/orders?storeId=${storeId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tables)).toBe(true);
  });

  // SSE
  test('TC-A-018: GET /api/sse/orders - SSE 연결 수립', async () => {
    const res = await request(app).get(`/api/sse/orders?storeId=${storeId}`).set('Authorization', `Bearer ${adminToken}`).buffer(false).parse((res, cb) => {
      res.on('data', () => { res.destroy(); cb(null, {}); });
    });
    expect(res.headers['content-type']).toContain('text/event-stream');
  });
});
