import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { validateSession } from '../utils/session';
import { loginSuccess, logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ClipboardList, ChefHat, LogOut, Store } from 'lucide-react';

export function AdminLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!isAuthenticated) {
      if (validateSession()) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <Header />
      <main className="p-6"><Outlet /></main>
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
    <header className="glass-effect sticky top-0 z-40 border-b border-slate-200/50 shadow-lg">
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-admin flex items-center justify-center shadow-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">매장 관리</h1>
          </div>
        </div>
        
        <nav className="flex items-center gap-3">
          <NavLink to="/admin/orders">
            {({ isActive }) => (
              <Button 
                size="lg"
                className={`
                  rounded-xl font-semibold px-6 shadow-md transition-all
                  ${isActive 
                    ? 'gradient-admin text-white' 
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }
                `}
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                주문 모니터링
                <Badge className={`ml-2 ${isActive ? 'bg-white/20' : 'bg-green-500 text-white'}`}>LIVE</Badge>
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/admin/menus">
            {({ isActive }) => (
              <Button 
                size="lg"
                className={`
                  rounded-xl font-semibold px-6 shadow-md transition-all
                  ${isActive 
                    ? 'gradient-admin text-white' 
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }
                `}
              >
                <ChefHat className="w-5 h-5 mr-2" />
                메뉴 관리
              </Button>
            )}
          </NavLink>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="lg"
            className="rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold px-6 shadow-md"
          >
            <LogOut className="w-5 h-5 mr-2" />
            로그아웃
          </Button>
        </nav>
      </div>
    </header>
  );
}
