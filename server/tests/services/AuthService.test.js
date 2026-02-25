const { getTestDb } = require('../../src/db');
const AuthService = require('../../src/services/AuthService');
const AdminRepository = require('../../src/repositories/AdminRepository');
const TableRepository = require('../../src/repositories/TableRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../../src/middleware/auth');

describe('AuthService', () => {
  let db, service, storeId;

  beforeEach(() => {
    db = getTestDb();
    const adminRepo = new AdminRepository(db);
    const tableRepo = new TableRepository(db);
    service = new AuthService(adminRepo, tableRepo);
    storeId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Store');
    const hash = bcrypt.hashSync('pass123', 10);
    db.prepare('INSERT INTO admins (id, storeId, username, passwordHash) VALUES (?, ?, ?, ?)').run(uuidv4(), storeId, 'admin', hash);
  });

  afterEach(() => db.close());

  test('TC-S-001: adminLogin - 성공 시 JWT 반환', () => {
    const result = service.adminLogin(storeId, 'admin', 'pass123');
    expect(result.token).toBeDefined();
    expect(result.expiresIn).toBe(57600);
    const decoded = jwt.verify(result.token, JWT_SECRET);
    expect(decoded.role).toBe('admin');
  });

  test('TC-S-002: adminLogin - 잘못된 비밀번호 시 UNAUTHORIZED', () => {
    expect(() => service.adminLogin(storeId, 'admin', 'wrong')).toThrow('UNAUTHORIZED');
  });

  test('TC-S-003: adminLogin - 5회 실패 후 LOGIN_LOCKED', () => {
    for (let i = 0; i < 4; i++) { try { service.adminLogin(storeId, 'admin', 'wrong'); } catch {} }
    expect(() => service.adminLogin(storeId, 'admin', 'wrong')).toThrow('LOGIN_LOCKED');
  });

  test('TC-S-004: adminLogin - 잠금 중 로그인 시도 거부', () => {
    const adminId = db.prepare('SELECT id FROM admins WHERE storeId = ?').get(storeId).id;
    db.prepare('UPDATE admins SET failedAttempts = 5, lockedUntil = ? WHERE id = ?').run(new Date(Date.now() + 300000).toISOString(), adminId);
    expect(() => service.adminLogin(storeId, 'admin', 'pass123')).toThrow('LOGIN_LOCKED');
  });

  test('TC-S-005: adminLogin - 성공 시 failedAttempts 초기화', () => {
    try { service.adminLogin(storeId, 'admin', 'wrong'); } catch {}
    service.adminLogin(storeId, 'admin', 'pass123');
    const admin = db.prepare('SELECT failedAttempts FROM admins WHERE storeId = ?').get(storeId);
    expect(admin.failedAttempts).toBe(0);
  });

  test('TC-S-006: tableLogin - 성공 시 token + sessionId 반환', () => {
    const hash = bcrypt.hashSync('1234', 10);
    const tableId = uuidv4();
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash) VALUES (?, ?, ?, ?)').run(tableId, storeId, 1, hash);
    const result = service.tableLogin(storeId, 1, '1234');
    expect(result.token).toBeDefined();
    expect(result.tableId).toBe(tableId);
    expect(result.sessionId).toBeDefined();
  });

  test('TC-S-007: tableLogin - 기존 세션 있으면 동일 sessionId 반환', () => {
    const hash = bcrypt.hashSync('1234', 10);
    const tableId = uuidv4();
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash, currentSessionId, status) VALUES (?, ?, ?, ?, ?, ?)').run(tableId, storeId, 1, hash, 'existing-session', 'active');
    const result = service.tableLogin(storeId, 1, '1234');
    expect(result.sessionId).toBe('existing-session');
  });

  test('TC-S-008: verifyToken - 유효한 토큰 검증', () => {
    const token = jwt.sign({ role: 'admin', storeId }, JWT_SECRET, { expiresIn: '16h' });
    const result = service.verifyToken(token);
    expect(result.valid).toBe(true);
    expect(result.role).toBe('admin');
  });

  test('TC-S-009: verifyToken - 만료 토큰 UNAUTHORIZED', () => {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '0s' });
    expect(() => service.verifyToken(token)).toThrow('UNAUTHORIZED');
  });

  test('adminLogin - 존재하지 않는 storeId → UNAUTHORIZED', () => {
    expect(() => service.adminLogin('nonexistent', 'admin', 'pass123')).toThrow('UNAUTHORIZED');
  });

  test('adminLogin - 존재하지 않는 username → UNAUTHORIZED', () => {
    expect(() => service.adminLogin(storeId, 'nobody', 'pass123')).toThrow('UNAUTHORIZED');
  });

  test('tableLogin - 잘못된 비밀번호 → UNAUTHORIZED', () => {
    const hash = require('bcryptjs').hashSync('1234', 10);
    db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash) VALUES (?, ?, ?, ?)').run(uuidv4(), storeId, 1, hash);
    expect(() => service.tableLogin(storeId, 1, 'wrong')).toThrow('UNAUTHORIZED');
  });

  test('tableLogin - 존재하지 않는 테이블 → UNAUTHORIZED', () => {
    expect(() => service.tableLogin(storeId, 99, '1234')).toThrow('UNAUTHORIZED');
  });
});
