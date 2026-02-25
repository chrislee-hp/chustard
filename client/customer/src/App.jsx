import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import TableLoginPage from './pages/TableLoginPage';
import MenuPage from './pages/MenuPage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SessionExpiredPage from './pages/SessionExpiredPage';

function AuthGuard({ children }) {
  const { auth, verify } = useAuth();
  const [isValid, setIsValid] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!auth?.token) {
      setIsValid(false);
      setIsChecking(false);
      return;
    }

    verify().then(valid => {
      setIsValid(valid);
      setIsChecking(false);
    });
  }, [auth?.token, verify]);

  if (isChecking) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return isValid ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<TableLoginPage />} />
      <Route path="/menu" element={<AuthGuard><MenuPage /></AuthGuard>} />
      <Route path="/order/confirm" element={<AuthGuard><OrderConfirmPage /></AuthGuard>} />
      <Route path="/order/success" element={<AuthGuard><OrderSuccessPage /></AuthGuard>} />
      <Route path="/orders" element={<AuthGuard><OrderHistoryPage /></AuthGuard>} />
      <Route path="/expired" element={<SessionExpiredPage />} />
      <Route path="*" element={<Navigate to={localStorage.getItem('token') ? '/menu' : '/login'} replace />} />
    </Routes>
  );
}
