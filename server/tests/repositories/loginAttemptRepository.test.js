import { getTestDb } from '../setup.js';
import { LoginAttemptRepository } from '../../src/repositories/loginAttemptRepository.js';

describe('LoginAttemptRepository', () => {
  let repo;
  let db;

  beforeEach(() => {
    db = getTestDb();
    db.exec(`INSERT INTO stores (id, name) VALUES ('store-001', 'Test Store')`);
    db.exec(`INSERT INTO admins (id, store_id, username, password_hash) VALUES ('admin-001', 'store-001', 'admin', 'hash')`);
    repo = new LoginAttemptRepository(db);
  });

  describe('create', () => {
    it('should create login attempt', () => {
      const attempt = repo.create({ id: 'attempt-001', adminId: 'admin-001', success: false });
      expect(attempt.success).toBe(0);
    });
  });

  describe('countRecentFailures', () => {
    it('should count failures in last 5 minutes', () => {
      for (let i = 0; i < 3; i++) {
        repo.create({ id: `attempt-${i}`, adminId: 'admin-001', success: false });
      }
      const count = repo.countRecentFailures('admin-001', 5);
      expect(count).toBe(3);
    });

    it('should not count successes', () => {
      repo.create({ id: 'attempt-001', adminId: 'admin-001', success: true });
      const count = repo.countRecentFailures('admin-001', 5);
      expect(count).toBe(0);
    });
  });
});
