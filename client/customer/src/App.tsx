import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, CartProvider, I18nProvider, ToastProvider } from './contexts'
import { AuthGuard, MainLayout, ToastContainer } from './components'
import { LoginSetupPage, MenuPage, OrderConfirmPage, OrderSuccessPage, OrderHistoryPage, SessionExpiredPage } from './pages'

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ToastContainer />
              <Routes>
                <Route path="/login" element={<LoginSetupPage />} />
                <Route path="/session-expired" element={<SessionExpiredPage />} />
                <Route path="/" element={<AuthGuard><MainLayout><Navigate to="/menu" replace /></MainLayout></AuthGuard>} />
                <Route path="/menu" element={<AuthGuard><MainLayout><MenuPage /></MainLayout></AuthGuard>} />
                <Route path="/order-confirm" element={<AuthGuard><MainLayout><OrderConfirmPage /></MainLayout></AuthGuard>} />
                <Route path="/order-success" element={<AuthGuard><MainLayout><OrderSuccessPage /></MainLayout></AuthGuard>} />
                <Route path="/orders" element={<AuthGuard><MainLayout><OrderHistoryPage /></MainLayout></AuthGuard>} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
