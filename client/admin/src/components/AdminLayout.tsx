import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { validateSession } from '../utils/session';
import { loginSuccess, logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

export function AdminLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!isAuthenticated) {
      if (validateSession()) {
        // sessionStorage에 유효한 토큰이 있으면 Redux 상태 복원
        const token = sessionStorage.getItem('admin_token')!;
        const user = { id: 'restored', storeId: '', username: '', role: 'admin' as const, createdAt: '' };
        dispatch(loginSuccess({ user, token }));
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, navigate, dispatch]);
  
  if (!isAuthenticated && !validateSession()) return null;
  
  return (
    <div className="admin-layout">
      <Header />
      <main><Outlet /></main>
    </div>
  );
}

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      dispatch(logout());
      navigate('/login');
    }
  };
  
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <NavLink to="/admin/orders" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#007bff' : '#333', fontWeight: isActive ? 'bold' : 'normal' })}>
          주문 모니터링
        </NavLink>
        <NavLink to="/admin/menus" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#007bff' : '#333', fontWeight: isActive ? 'bold' : 'normal' })}>
          메뉴 관리
        </NavLink>
      </nav>
      <button onClick={handleLogout}>로그아웃</button>
    </header>
  );
}
