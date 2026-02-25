import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 5;
const ADMIN_TOKEN_EXPIRY = '16h';
const ADMIN_TOKEN_EXPIRY_SECONDS = 16 * 60 * 60;
const TABLE_TOKEN_EXPIRY = '24h';
const TOKEN_REFRESH_THRESHOLD = 3600;

export class AuthService {
  constructor(adminRepo, tableRepo, sessionRepo, loginAttemptRepo, jwtSecret) {
    this.adminRepo = adminRepo;
    this.tableRepo = tableRepo;
    this.sessionRepo = sessionRepo;
    this.loginAttemptRepo = loginAttemptRepo;
    this.jwtSecret = jwtSecret;
  }

  async adminLogin(storeId, username, password) {
    const admin = this.adminRepo.findByStoreAndUsername(storeId, username);
    if (!admin) throw new Error('UNAUTHORIZED');

    const failures = this.loginAttemptRepo.countRecentFailures(admin.id, LOGIN_LOCK_MINUTES);
    if (failures >= MAX_LOGIN_ATTEMPTS) throw new Error('LOGIN_LOCKED');

    const valid = await bcrypt.compare(password, admin.passwordHash);
    this.loginAttemptRepo.create({ id: uuidv4(), adminId: admin.id, success: valid });

    if (!valid) throw new Error('UNAUTHORIZED');

    const token = jwt.sign({ role: 'admin', storeId, adminId: admin.id }, this.jwtSecret, { expiresIn: ADMIN_TOKEN_EXPIRY });
    return { token, expiresIn: ADMIN_TOKEN_EXPIRY_SECONDS };
  }

  async tableLogin(storeId, tableNumber, password) {
    const table = this.tableRepo.findByStoreAndNumber(storeId, tableNumber);
    if (!table || table.password !== password) throw new Error('UNAUTHORIZED');

    let sessionId = table.currentSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      this.sessionRepo.create({ id: sessionId, tableId: table.id });
      this.tableRepo.updateSession(table.id, sessionId, 'active');
    }

    const token = jwt.sign({ role: 'table', storeId, tableId: table.id, sessionId }, this.jwtSecret, { expiresIn: TABLE_TOKEN_EXPIRY });
    return { token, tableId: table.id, sessionId, storeId };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      const now = Math.floor(Date.now() / 1000);
      const needsRefresh = decoded.exp - now < TOKEN_REFRESH_THRESHOLD;
      
      let newToken = null;
      if (needsRefresh) {
        const { role, storeId, adminId, tableId, sessionId } = decoded;
        const payload = role === 'admin' ? { role, storeId, adminId } : { role, storeId, tableId, sessionId };
        newToken = jwt.sign(payload, this.jwtSecret, { expiresIn: role === 'admin' ? ADMIN_TOKEN_EXPIRY : TABLE_TOKEN_EXPIRY });
      }

      return { valid: true, role: decoded.role, tableId: decoded.tableId || null, newToken };
    } catch {
      return { valid: false };
    }
  }
}
