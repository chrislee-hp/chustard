class AdminRepository {
  constructor(db) { this.db = db; }

  findByStoreAndUsername(storeId, username) {
    return this.db.prepare('SELECT * FROM admins WHERE storeId = ? AND username = ?').get(storeId, username) || null;
  }

  updateLoginAttempt(id, failedAttempts, lockedUntil) {
    this.db.prepare('UPDATE admins SET failedAttempts = ?, lockedUntil = ? WHERE id = ?').run(failedAttempts, lockedUntil, id);
  }
}
module.exports = AdminRepository;
