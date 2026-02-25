const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../middleware/auth');

class AuthService {
  constructor(adminRepo, tableRepo) { this.adminRepo = adminRepo; this.tableRepo = tableRepo; }

  adminLogin(storeId, username, password) {
    const admin = this.adminRepo.findByStoreAndUsername(storeId, username);
    if (!admin) throw new Error('UNAUTHORIZED');
    if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) throw new Error('LOGIN_LOCKED');
    if (!bcrypt.compareSync(password, admin.passwordHash)) {
      const attempts = admin.failedAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 300000).toISOString() : null;
      this.adminRepo.updateLoginAttempt(admin.id, attempts, lockedUntil);
      if (attempts >= 5) throw new Error('LOGIN_LOCKED');
      throw new Error('UNAUTHORIZED');
    }
    this.adminRepo.updateLoginAttempt(admin.id, 0, null);
    const token = jwt.sign({ role: 'admin', storeId, adminId: admin.id }, JWT_SECRET, { expiresIn: '16h' });
    return { token, expiresIn: 57600 };
  }

  tableLogin(storeId, tableNumber, password) {
    const table = this.tableRepo.findByStoreAndNumber(storeId, tableNumber);
    if (!table || !bcrypt.compareSync(password, table.passwordHash)) throw new Error('UNAUTHORIZED');
    let sessionId = table.currentSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      this.tableRepo.updateSession(table.id, sessionId, table.status);
    }
    const token = jwt.sign({ role: 'table', storeId, tableId: table.id, sessionId }, JWT_SECRET, { expiresIn: '16h' });
    return { token, tableId: table.id, sessionId };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, role: decoded.role, tableId: decoded.tableId || null };
    } catch { throw new Error('UNAUTHORIZED'); }
  }
}
module.exports = AuthService;
