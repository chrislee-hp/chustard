import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { validateSession, createMockUser } from '../utils/session';
import { loginSuccess } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

export function AdminLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Try to restore session from sessionStorage
    if (!isAuthenticated && validateSession()) {
      const token = sessionStorage.getItem('admin_token');
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
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('token_expiry');
      navigate('/login');
    }
  };
  
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <NavLink 
          to="/admin/orders" 
          style={({ isActive }) => ({ 
            textDecoration: 'none', 
            color: isActive ? '#007bff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal'
          })}
        >
          주문 모니터링
        </NavLink>
        <NavLink 
          to="/admin/menus" 
          style={({ isActive }) => ({ 
            textDecoration: 'none', 
            color: isActive ? '#007bff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal'
          })}
        >
          메뉴 관리
        </NavLink>
      </nav>
      <button onClick={handleLogout}>로그아웃</button>
    </header>
  );
}
