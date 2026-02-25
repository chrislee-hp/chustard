import React from 'react';
import type { Table } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Users, ShoppingBag, Bell } from 'lucide-react';

interface TableCardProps {
  table: Table;
  isNew: boolean;
  onClick: () => void;
}

export function TableCard({ table, isNew, onClick }: TableCardProps) {
  const statusColor = table.isActive 
    ? 'bg-green-500' 
    : 'bg-gray-400';

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${isNew ? 'ring-2 ring-orange-500 ring-offset-2 animate-pulse' : ''}
        ${table.isActive ? 'gradient-card' : 'bg-gray-50'}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${table.isActive ? 'bg-slate-700' : 'bg-gray-400'} flex items-center justify-center`}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">테이블 {table.tableNumber}</h3>
              <Badge className={`${statusColor} text-white text-xs mt-1`}>
                {table.isActive ? '이용중' : '비활성'}
              </Badge>
            </div>
          </div>
          {isNew && (
            <Badge className="bg-orange-500 text-white animate-bounce">
              <Bell className="w-3 h-3 mr-1" />
              NEW
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              총 주문액
            </span>
            <span className="font-bold text-xl text-slate-800">₩{table.totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>주문 수</span>
            <span className="font-semibold">{table.orderCount}건</span>
          </div>
        </div>
        
        {table.orders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">최근 주문</p>
            <div className="space-y-2">
              {table.orders.slice(0, 2).map(order => (
                <div key={order.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg shadow-sm">
                  <span className="font-medium">{order.orderNumber}</span>
                  <Badge variant="outline" className={`
                    ${order.status === 'pending' ? 'border-yellow-500 text-yellow-600' : ''}
                    ${order.status === 'preparing' ? 'border-blue-500 text-blue-600' : ''}
                    ${order.status === 'completed' ? 'border-green-500 text-green-600' : ''}
                  `}>
                    {order.status === 'pending' && '대기중'}
                    {order.status === 'preparing' && '준비중'}
                    {order.status === 'completed' && '완료'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
