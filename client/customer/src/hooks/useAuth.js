import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, CONSTANTS } from '../config';

export function useAuth() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem(CONSTANTS.TOKEN_KEY);
    const tableId = localStorage.getItem(CONSTANTS.TABLE_ID_KEY);
    const sessionId = localStorage.getItem(CONSTANTS.SESSION_ID_KEY);
    const storeId = localStorage.getItem(CONSTANTS.STORE_ID_KEY);
    return token ? { token, tableId, sessionId, storeId } : null;
  });

  const login = useCallback(async (storeId, tableNumber, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/table/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, tableNumber: Number(tableNumber), password }),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await res.json();
      localStorage.setItem(CONSTANTS.TOKEN_KEY, data.token);
      localStorage.setItem(CONSTANTS.TABLE_ID_KEY, data.tableId);
      localStorage.setItem(CONSTANTS.SESSION_ID_KEY, data.sessionId);
      localStorage.setItem(CONSTANTS.STORE_ID_KEY, storeId);
      setAuth({ token: data.token, tableId: data.tableId, sessionId: data.sessionId, storeId });
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    [CONSTANTS.TOKEN_KEY, CONSTANTS.TABLE_ID_KEY, CONSTANTS.SESSION_ID_KEY, CONSTANTS.STORE_ID_KEY]
      .forEach(k => localStorage.removeItem(k));
    setAuth(null);
  }, []);

  const verify = useCallback(async () => {
    if (!auth?.token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return res.ok;
    } catch (error) {
      console.error('Verify error:', error);
      return false;
    }
  }, [auth?.token]);

  return { auth, login, logout, verify };
}
