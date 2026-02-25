import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { orderReceived, orderUpdated, orderDeleted, markOrderAsNew } from '../store/slices/dashboardSlice';
import type { Order } from '../types';
import type { RootState } from '../store/store';

/**
 * Custom hook for managing SSE connection
 * Handles order events and dispatches to Redux
 */
export function useSSE() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token || !isAuthenticated) return;
    
    // TODO: Replace with actual SSE endpoint when API is ready
    const eventSource = new EventSource(`/api/sse/orders?token=${token}`);
    
    eventSource.onopen = () => {
      console.log('SSE connected');
    };
    
    eventSource.addEventListener('order:created', (e) => {
      const { order: raw } = JSON.parse(e.data);
      const order: Order = {
        ...raw,
        id: String(raw.id),
        orderNumber: `#${String(raw.id).slice(-6)}`,
        tableNumber: '',
        items: (raw.items || []).map((item: Record<string, unknown>) => ({
          menuId: item.menuId,
          menuName: item.nameKo || '',
          menuNameEn: item.nameEn || '',
          quantity: item.quantity,
          price: item.price,
          subtotal: (item.price as number) * (item.quantity as number),
        })),
      };
      console.log('Order created:', order);
      dispatch(orderReceived(order));
      dispatch(markOrderAsNew(order.tableId));
      // TODO: Add notification sound
      // playNotificationSound();
    });
    
    eventSource.addEventListener('order:status-changed', (e) => {
      const { orderId, status } = JSON.parse(e.data);
      console.log('Order status changed:', orderId, status);
      dispatch(orderUpdated({ id: orderId, status } as Order));
    });
    
    eventSource.addEventListener('order:deleted', (e) => {
      const { orderId, tableId } = JSON.parse(e.data);
      console.log('Order deleted:', orderId, tableId);
      dispatch(orderDeleted({ orderId, tableId }));
    });
    
    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [dispatch, isAuthenticated]);
}
