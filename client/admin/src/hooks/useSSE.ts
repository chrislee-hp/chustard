import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Custom hook for managing SSE connection
 * Handles order events and dispatches to Redux
 */
export function useSSE() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    const eventSource = new EventSource(`/api/sse?token=${token}`);
    
    eventSource.onopen = () => {
      console.log('SSE connected');
    };
    
    eventSource.addEventListener('order:created', (e) => {
      const order = JSON.parse(e.data);
      console.log('Order created:', order);
      // dispatch(orderReceived(order));
      // playNotificationSound();
    });
    
    eventSource.addEventListener('order:updated', (e) => {
      const order = JSON.parse(e.data);
      console.log('Order updated:', order);
      // dispatch(orderUpdated(order));
    });
    
    eventSource.addEventListener('order:deleted', (e) => {
      const { orderId, tableId } = JSON.parse(e.data);
      console.log('Order deleted:', orderId, tableId);
      // dispatch(orderDeleted(orderId, tableId));
    });
    
    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [dispatch]);
}
