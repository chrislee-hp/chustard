import { validateSession, isTokenExpired } from '../../src/utils/session';

describe('Session Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('validateSession', () => {
    it('should return true for valid token', () => {
      localStorage.setItem('admin_token', 'valid-token');
      localStorage.setItem('token_expiry', String(Date.now() + 1000000));

      expect(validateSession()).toBe(true);
    });

    it('should return false for expired token', () => {
      localStorage.setItem('admin_token', 'expired-token');
      localStorage.setItem('token_expiry', String(Date.now() - 1000));

      expect(validateSession()).toBe(false);
      expect(localStorage.getItem('admin_token')).toBeNull();
    });

    it('should return false when token is missing', () => {
      expect(validateSession()).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      localStorage.setItem('token_expiry', String(Date.now() + 1000000));

      expect(isTokenExpired()).toBe(false);
    });

    it('should return true for expired token', () => {
      localStorage.setItem('token_expiry', String(Date.now() - 1000));

      expect(isTokenExpired()).toBe(true);
    });
  });
});
