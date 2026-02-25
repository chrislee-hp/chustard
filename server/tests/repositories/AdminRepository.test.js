const { getTestDb } = require('../../src/db');
const AdminRepository = require('../../src/repositories/AdminRepository');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

describe('AdminRepository', () => {
  let db, repo, storeId;

  beforeEach(() => {
    db = getTestDb();
    repo = new AdminRepository(db);
    storeId = uuidv4();
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, 'Test Store');
  });

  afterEach(() => db.close());

  const seedAdmin = (overrides = {}) => {
    const id = uuidv4();
    const hash = bcrypt.hashSync('password123', 10);
    db.prepare('INSERT INTO admins (id, storeId, username, passwordHash, failedAttempts, lockedUntil) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, storeId, overrides.username || 'admin', hash, overrides.failedAttempts || 0, overrides.lockedUntil || null);
    return id;
  };

  test('TC-R-001: findByStoreAndUsername - 존재하는 admin 반환', () => {
    seedAdmin({ username: 'admin1' });
    const result = repo.findByStoreAndUsername(storeId, 'admin1');
    expect(result).not.toBeNull();
    expect(result.username).toBe('admin1');
    expect(result.storeId).toBe(storeId);
  });

  test('TC-R-002: findByStoreAndUsername - 없으면 null', () => {
    const result = repo.findByStoreAndUsername(storeId, 'nonexistent');
    expect(result).toBeNull();
  });

  test('updateLoginAttempt - failedAttempts와 lockedUntil 업데이트', () => {
    const id = seedAdmin();
    const lockTime = new Date().toISOString();
    repo.updateLoginAttempt(id, 5, lockTime);
    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
    expect(admin.failedAttempts).toBe(5);
    expect(admin.lockedUntil).toBe(lockTime);
  });
});
