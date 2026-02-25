import React from 'react';
import type { Table } from '../types';

interface TableCardProps {
  table: Table;
  isNew: boolean;
  onClick: () => void;
}

export function TableCard({ table, isNew, onClick }: TableCardProps) {
  return (
    <div 
      className={`table-card ${isNew ? 'new-order' : ''} ${table.isActive ? 'active' : 'inactive'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <h3>테이블 {table.tableNumber}</h3>
      <p>총 주문액: ₩{table.totalAmount.toLocaleString()}</p>
      <p>주문 수: {table.orderCount}</p>
      
      <div className="order-preview">
        {table.orders.map(order => (
          <div key={order.id} className="order-item">
            <span>{order.orderNumber}</span>
            <span>{order.status}</span>
            <span>₩{order.totalAmount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
