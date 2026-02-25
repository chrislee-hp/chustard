import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
      state.tokenExpiry = Date.now() + 16 * 60 * 60 * 1000; // 16 hours
      
      // Store in localStorage
      localStorage.setItem('admin_token', token);
      localStorage.setItem('token_expiry', String(state.tokenExpiry));
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
      
      // Clear localStorage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token_expiry');
    }
  }
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
