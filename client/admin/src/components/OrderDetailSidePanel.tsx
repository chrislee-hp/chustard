import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeSidePanel } from '../store/slices/dashboardSlice';
import { updateOrderStatus, deleteOrder, completeSession } from '../store/slices/ordersSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { Order, OrderStatus } from '../types';

export function OrderDetailSidePanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTableId, tables } = useSelector((state: RootState) => state.dashboard);
  
  const table = tables.find(t => t.id === selectedTableId);
  
  const handleClose = () => {
    dispatch(closeSidePanel());
  };
  
  const handleCompleteSession = () => {
    if (table && confirm('테이블 이용을 완료 처리하시겠습니까?')) {
      dispatch(completeSession(table.id));
      handleClose();
    }
  };
  
  if (!table) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          backgroundColor: 'white',
          padding: '2rem',
          overflowY: 'auto',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>테이블 {table.tableNumber}</h2>
          <button onClick={handleClose}>✕</button>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <p>총 주문액: ₩{table.totalAmount.toLocaleString()}</p>
          <p>주문 수: {table.orderCount}</p>
        </div>
        
        <OrderList orders={table.orders} />
        
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={handleCompleteSession} style={{ padding: '0.5rem' }}>
            이용 완료
          </button>
          <button onClick={handleClose} style={{ padding: '0.5rem' }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  const dispatch = useDispatch<AppDispatch>();
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  
  const getNextStatus = (status: OrderStatus): OrderStatus => {
    const map: Record<OrderStatus, OrderStatus> = {
      pending: 'preparing',
      preparing: 'completed',
      completed: 'completed'
    };
    return map[status];
  };
  
  const getNextStatusLabel = (status: OrderStatus): string => {
    const map: Record<OrderStatus, string> = {
      pending: '준비 시작',
      preparing: '완료 처리',
      completed: '완료됨'
    };
    return map[status];
  };
  
  const handleStatusChange = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    
    if (nextStatus === 'completed') {
      if (confirm('주문을 완료 처리하시겠습니까?')) {
        dispatch(updateOrderStatus({ orderId: order.id, status: nextStatus }));
      }
    } else {
      dispatch(updateOrderStatus({ orderId: order.id, status: nextStatus }));
    }
  };
  
  const handleDelete = (orderId: string) => {
    if (deletingOrderId === orderId && confirmStep === 2) {
      if (confirm('정말 삭제하시겠습니까?')) {
        dispatch(deleteOrder(orderId));
        setDeletingOrderId(null);
        setConfirmStep(1);
      }
    } else {
      if (confirm('삭제하시겠습니까?')) {
        setDeletingOrderId(orderId);
        setConfirmStep(2);
        setTimeout(() => handleDelete(orderId), 100);
      }
    }
  };
  
  if (orders.length === 0) {
    return <p>주문이 없습니다.</p>;
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {orders.map(order => (
        <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
          <h4>{order.orderNumber}</h4>
          <p>상태: {order.status}</p>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.menuName} x {item.quantity} = ₩{item.subtotal.toLocaleString()}
              </li>
            ))}
          </ul>
          <p><strong>총액: ₩{order.totalAmount.toLocaleString()}</strong></p>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {order.status !== 'completed' && (
              <button onClick={() => handleStatusChange(order)} style={{ flex: 1, padding: '0.5rem' }}>
                {getNextStatusLabel(order.status)}
              </button>
            )}
            <button onClick={() => handleDelete(order.id)} style={{ padding: '0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
