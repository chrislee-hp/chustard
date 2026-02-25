import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AdminUser, LoginCredentials } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  tokenExpiry: 0
};

export const loginRequest = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials): Promise<{ user: AdminUser; token: string }> => {
    throw new Error('NotImplementedError: loginRequest');
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (): Promise<{ user: AdminUser; token: string } | null> => {
    throw new Error('NotImplementedError: restoreSession');
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginRequest.fulfilled, (state, action) => {
        // Will be implemented
      })
      .addCase(loginRequest.rejected, (state, action) => {
        // Will be implemented
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        // Will be implemented
      });
  }
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
