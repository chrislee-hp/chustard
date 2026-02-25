import { validateSession, isTokenExpired } from '../../src/utils/session';

describe('Session Utils', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('validateSession', () => {
    it('should return true for valid token', () => {
      sessionStorage.setItem('admin_token', 'valid-token');
      sessionStorage.setItem('token_expiry', String(Date.now() + 1000000));

      expect(validateSession()).toBe(true);
    });

    it('should return false for expired token', () => {
      sessionStorage.setItem('admin_token', 'expired-token');
      sessionStorage.setItem('token_expiry', String(Date.now() - 1000));

      expect(validateSession()).toBe(false);
      expect(sessionStorage.getItem('admin_token')).toBeNull();
    });

    it('should return false when token is missing', () => {
      expect(validateSession()).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      sessionStorage.setItem('token_expiry', String(Date.now() + 1000000));

      expect(isTokenExpired()).toBe(false);
    });

    it('should return true for expired token', () => {
      sessionStorage.setItem('token_expiry', String(Date.now() - 1000));

      expect(isTokenExpired()).toBe(true);
    });
  });
});
