const { createApp } = require('../src/app');
const { getTestDb } = require('../src/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

let db, server, baseUrl;
const storeId = uuidv4();

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const opts = { method, hostname: url.hostname, port: url.port, path: url.pathname + url.search, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

beforeAll(done => {
  db = getTestDb();
  // seed
  db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'E2E식당');
  db.prepare('INSERT INTO admins (id, storeId, username, passwordHash) VALUES (?, ?, ?, ?)').run(uuidv4(), storeId, 'admin', bcrypt.hashSync('pass123', 10));
  db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash, status) VALUES (?, ?, ?, ?, ?)').run('t1', storeId, 1, bcrypt.hashSync('1234', 10), 'inactive');
  const catId = uuidv4();
  db.prepare('INSERT INTO categories (id, storeId, name, sortOrder) VALUES (?, ?, ?, ?)').run(catId, storeId, '메인', 0);
  db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price, sortOrder) VALUES (?, ?, ?, ?, ?, ?)').run('m1', catId, '김치찌개', 'Kimchi Stew', 9000, 0);
  db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price, sortOrder) VALUES (?, ?, ?, ?, ?, ?)').run('m2', catId, '콜라', 'Cola', 2000, 1);

  const app = createApp(db);
  server = app.listen(0, () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    done();
  });
});

afterAll(done => { server.close(() => { db.close(); done(); }); });

describe('E2E: Full Order Flow', () => {
  let adminToken, tableToken, sessionId, orderId;

  test('1. 관리자 로그인', async () => {
    const res = await req('POST', '/api/admin/login', { storeId, username: 'admin', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  test('2. 테이블 로그인', async () => {
    const res = await req('POST', '/api/table/login', { storeId, tableNumber: 1, password: '1234' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    tableToken = res.body.token;
    sessionId = res.body.sessionId;
  });

  test('3. 메뉴 조회', async () => {
    const res = await req('GET', `/api/menus?storeId=${storeId}`);
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(1);
    expect(res.body.categories[0].menus).toHaveLength(2);
  });

  test('4. 주문 생성', async () => {
    const res = await req('POST', '/api/orders', { tableId: 't1', sessionId, items: [{ menuId: 'm1', quantity: 2 }, { menuId: 'm2', quantity: 1 }] }, tableToken);
    expect(res.status).toBe(201);
    expect(res.body.order.totalAmount).toBe(20000);
    orderId = res.body.order.id;
  });

  test('5. 고객 주문 내역 조회', async () => {
    const res = await req('GET', `/api/orders?tableId=t1&sessionId=${sessionId}`, null, tableToken);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].status).toBe('pending');
  });

  test('6. 관리자 주문 목록 조회', async () => {
    const res = await req('GET', `/api/admin/orders?storeId=${storeId}`, null, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.tables.length).toBeGreaterThan(0);
  });

  test('7. 주문 상태 변경 (pending → preparing)', async () => {
    const res = await req('PUT', `/api/admin/orders/${orderId}/status`, { status: 'preparing' }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('preparing');
  });

  test('8. 주문 상태 변경 (preparing → completed)', async () => {
    const res = await req('PUT', `/api/admin/orders/${orderId}/status`, { status: 'completed' }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('completed');
  });

  test('9. 테이블 이용 완료', async () => {
    const res = await req('POST', '/api/admin/tables/t1/complete', {}, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('10. 주문 내역 확인', async () => {
    const res = await req('GET', `/api/admin/orders/history?storeId=${storeId}`, null, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].totalAmount).toBe(20000);
  });
});
