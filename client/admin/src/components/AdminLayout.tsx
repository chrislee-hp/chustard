import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { validateSession, createMockUser } from '../utils/session';
import { loginSuccess } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

export function AdminLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Try to restore session from localStorage
    if (!isAuthenticated && validateSession()) {
      const token = localStorage.getItem('admin_token');
      if (token) {
        // Restore mock user - TODO: Decode from JWT in production
        const mockUser = createMockUser('store-1', 'admin');
        dispatch(loginSuccess({ user: mockUser, token }));
        return;
      }
    }
    
    if (!isAuthenticated || !validateSession()) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate, dispatch]);
  
  if (!isAuthenticated && !validateSession()) {
    return null;
  }
  
  return (
    <div className="admin-layout">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      // dispatch(logout());
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token_expiry');
      navigate('/login');
    }
  };
  
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <a href="/admin/orders" style={{ textDecoration: 'none', color: '#333' }}>주문 모니터링</a>
        <a href="/admin/menus" style={{ textDecoration: 'none', color: '#333' }}>메뉴 관리</a>
      </nav>
      <button onClick={handleLogout}>로그아웃</button>
    </header>
  );
}
