import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TableManagePage from './pages/TableManagePage';
import MenuManagePage from './pages/MenuManagePage';
import OrderHistoryPage from './pages/OrderHistoryPage';

function AuthGuard({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" />;
}

function NavBar() {
  const loc = useLocation();
  const links = [
    { to: '/', label: '대시보드' },
    { to: '/tables', label: '테이블 관리' },
    { to: '/menus', label: '메뉴 관리' },
    { to: '/history', label: '주문 내역' },
  ];
  return (
    <nav>
      {links.map(l => (
        <Link key={l.to} to={l.to} style={{ fontWeight: loc.pathname === l.to ? 'bold' : 'normal', marginRight: '16px' }}>{l.label}</Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <AuthGuard>
          <NavBar />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tables" element={<TableManagePage />} />
            <Route path="/menus" element={<MenuManagePage />} />
            <Route path="/history" element={<OrderHistoryPage />} />
          </Routes>
        </AuthGuard>
      } />
    </Routes>
  );
}
