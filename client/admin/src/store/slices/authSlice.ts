import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOKEN_EXPIRY_MS } from '../../constants';
import type { AuthState, AdminUser, LoginCredentials } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  tokenExpiry: 0
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: AdminUser; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.tokenExpiry = Date.now() + TOKEN_EXPIRY_MS;
      
      // Store in sessionStorage (more secure than localStorage)
      // TODO: Use httpOnly cookies when real API is implemented
      sessionStorage.setItem('admin_token', token);
      sessionStorage.setItem('token_expiry', String(state.tokenExpiry));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenExpiry = 0;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenExpiry = 0;
      
      // Clear sessionStorage
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('token_expiry');
    }
  }
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
