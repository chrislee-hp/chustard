import authReducer, { loginSuccess, loginFailure, logout } from '../../src/store/slices/authSlice';
import type { AuthState, AdminUser } from '../../src/types';

describe('AuthSlice', () => {
  describe('loginSuccess', () => {
    it('should store token and user in state', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        tokenExpiry: 0
      };

      const mockUser: AdminUser = {
        id: '1',
        storeId: 'store-123',
        username: 'admin',
        role: 'admin',
        createdAt: '2026-02-25T00:00:00Z'
      };

      const mockToken = 'jwt-token-123';

      const action = loginSuccess({ user: mockUser, token: mockToken });
      const newState = authReducer(initialState, action);

      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toEqual(mockToken);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.tokenExpiry).toBeGreaterThan(Date.now());
    });
  });

  describe('loginFailure', () => {
    it('should clear auth state and remain unauthenticated', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        tokenExpiry: 0
      };

      const errorMessage = 'Invalid credentials';

      const action = loginFailure(errorMessage);
      const newState = authReducer(initialState, action);

      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear session and localStorage', () => {
      const initialState: AuthState = {
        user: {
          id: '1',
          storeId: 'store-123',
          username: 'admin',
          role: 'admin',
          createdAt: '2026-02-25T00:00:00Z'
        },
        token: 'jwt-token-123',
        isAuthenticated: true,
        tokenExpiry: Date.now() + 1000000
      };

      const action = logout();
      const newState = authReducer(initialState, action);

      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.tokenExpiry).toBe(0);
    });
  });
});
