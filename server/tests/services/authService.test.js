import { AuthService } from '../../src/services/authService.js';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service;
  let mockAdminRepo, mockTableRepo, mockSessionRepo, mockLoginAttemptRepo;

  beforeEach(() => {
    mockAdminRepo = {
      findByStoreAndUsername: jest.fn(),
      findById: jest.fn()
    };
    mockTableRepo = {
      findByStoreAndNumber: jest.fn(),
      updateSession: jest.fn()
    };
    mockSessionRepo = {
      create: jest.fn(),
      findById: jest.fn()
    };
    mockLoginAttemptRepo = {
      create: jest.fn(),
      countRecentFailures: jest.fn()
    };
    service = new AuthService(mockAdminRepo, mockTableRepo, mockSessionRepo, mockLoginAttemptRepo, 'test-secret');
  });

  describe('adminLogin', () => {
    it('should return token on valid credentials', async () => {
      const hash = await bcrypt.hash('password', 10);
      mockAdminRepo.findByStoreAndUsername.mockReturnValue({ id: 'admin-001', storeId: 'store-001', passwordHash: hash });
      mockLoginAttemptRepo.countRecentFailures.mockReturnValue(0);

      const result = await service.adminLogin('store-001', 'admin', 'password');
      expect(result.token).toBeDefined();
      expect(result.expiresIn).toBe(57600);
    });

    it('should throw on invalid password', async () => {
      const hash = await bcrypt.hash('password', 10);
      mockAdminRepo.findByStoreAndUsername.mockReturnValue({ id: 'admin-001', storeId: 'store-001', passwordHash: hash });
      mockLoginAttemptRepo.countRecentFailures.mockReturnValue(0);

      await expect(service.adminLogin('store-001', 'admin', 'wrong')).rejects.toThrow('UNAUTHORIZED');
    });

    it('should throw LOGIN_LOCKED after 5 failures', async () => {
      mockAdminRepo.findByStoreAndUsername.mockReturnValue({ id: 'admin-001', storeId: 'store-001' });
      mockLoginAttemptRepo.countRecentFailures.mockReturnValue(5);

      await expect(service.adminLogin('store-001', 'admin', 'password')).rejects.toThrow('LOGIN_LOCKED');
    });
  });

  describe('tableLogin', () => {
    it('should create new session if none exists', async () => {
      mockTableRepo.findByStoreAndNumber.mockReturnValue({ id: 'table-001', storeId: 'store-001', password: '1234', currentSessionId: null });
      mockSessionRepo.create.mockReturnValue({ id: 'session-001' });

      const result = await service.tableLogin('store-001', 1, '1234');
      expect(result.token).toBeDefined();
      expect(result.sessionId).toBe('session-001');
      expect(mockTableRepo.updateSession).toHaveBeenCalled();
    });

    it('should reuse existing session', async () => {
      mockTableRepo.findByStoreAndNumber.mockReturnValue({ id: 'table-001', storeId: 'store-001', password: '1234', currentSessionId: 'session-001' });

      const result = await service.tableLogin('store-001', 1, '1234');
      expect(result.sessionId).toBe('session-001');
      expect(mockSessionRepo.create).not.toHaveBeenCalled();
    });

    it('should throw on invalid password', async () => {
      mockTableRepo.findByStoreAndNumber.mockReturnValue({ id: 'table-001', password: '1234' });

      await expect(service.tableLogin('store-001', 1, '0000')).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('verifyToken', () => {
    it('should return valid for good token', async () => {
      const hash = await bcrypt.hash('password', 10);
      mockAdminRepo.findByStoreAndUsername.mockReturnValue({ id: 'admin-001', storeId: 'store-001', passwordHash: hash });
      mockLoginAttemptRepo.countRecentFailures.mockReturnValue(0);

      const { token } = await service.adminLogin('store-001', 'admin', 'password');
      const result = service.verifyToken(token);
      expect(result.valid).toBe(true);
      expect(result.role).toBe('admin');
    });

    it('should return invalid for bad token', () => {
      const result = service.verifyToken('invalid-token');
      expect(result.valid).toBe(false);
    });
  });
});
