import { useState, useCallback } from 'react';
import { API_BASE_URL, CONSTANTS } from '../config';

export function useAdminAuth() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem(CONSTANTS.ADMIN_TOKEN_KEY);
    const storeId = localStorage.getItem(CONSTANTS.ADMIN_STORE_ID_KEY);
    return token ? { token, storeId } : null;
  });

  const login = useCallback(async (storeId, username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, username, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.code || 'UNAUTHORIZED');
      }

      const data = await res.json();
      localStorage.setItem(CONSTANTS.ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(CONSTANTS.ADMIN_STORE_ID_KEY, storeId);
      setAuth({ token: data.token, storeId });
      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CONSTANTS.ADMIN_TOKEN_KEY);
    localStorage.removeItem(CONSTANTS.ADMIN_STORE_ID_KEY);
    setAuth(null);
  }, []);

  const fetchAuth = useCallback(async (url, options = {}) => {
    try {
      const token = localStorage.getItem(CONSTANTS.ADMIN_TOKEN_KEY);
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }, []);

  return { auth, login, logout, fetchAuth };
}
