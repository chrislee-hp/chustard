import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { useSSE } from './hooks/useSSE';
import { LoginPage } from './components/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { OrderMonitoringTab } from './components/OrderMonitoringTab';
import { MenuManagementTab } from './components/MenuManagementTab';

function AppContent() {
  useSSE();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrderMonitoringTab />} />
          <Route path="menus/*" element={<MenuManagementTab />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
