import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeSidePanel } from '../store/slices/dashboardSlice';
import { updateOrderStatus, deleteOrder, completeSession } from '../store/slices/ordersSlice';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { X, Users, CheckCircle, Trash2, ChefHat, Clock, Check } from 'lucide-react';
import type { RootState, AppDispatch } from '../store/store';
import type { Order, OrderStatus } from '../types';

export function OrderDetailSidePanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTableId, tables } = useSelector((state: RootState) => state.dashboard);
  const table = tables.find(t => t.id === selectedTableId);
  
  const handleClose = () => dispatch(closeSidePanel());
  
  const handleCompleteSession = () => {
    if (table && confirm('테이블 이용을 완료 처리하시겠습니까?')) {
      dispatch(completeSession(table.id));
      handleClose();
    }
  };
  
  if (!table) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={handleClose}>
      <div 
        className="absolute top-0 right-0 bottom-0 w-[450px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl gradient-admin flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">테이블 {table.tableNumber}</h2>
                <Badge className="bg-green-500 text-white mt-1">이용중</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-slate-200">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">총 주문액</span>
              <span className="text-3xl font-bold text-slate-800">₩{table.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
              <span>주문 수</span>
              <span>{table.orderCount}건</span>
            </div>
          </div>
        </div>
        
        {/* Order List */}
        <div className="flex-1 overflow-y-auto p-6">
          <OrderList orders={table.orders} />
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
          <Button 
            onClick={handleCompleteSession}
            size="lg"
            className="w-full gradient-admin hover:opacity-90 font-semibold h-14"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            이용 완료
          </Button>
          <Button 
            onClick={handleClose}
            variant="outline"
            size="lg"
            className="w-full border-2 border-slate-300 font-semibold h-12"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  const dispatch = useDispatch<AppDispatch>();
  
  const handleStatusChange = (order: Order) => {
    const nextStatus: Record<OrderStatus, OrderStatus> = {
      pending: 'preparing',
      preparing: 'completed',
      completed: 'completed'
    };
    const next = nextStatus[order.status];
    if (next === 'completed' && !confirm('주문을 완료 처리하시겠습니까?')) return;
    dispatch(updateOrderStatus({ orderId: order.id, status: next }));
  };
  
  const handleDelete = (orderId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      dispatch(deleteOrder(orderId));
    }
  };
  
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">주문이 없습니다</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Card key={order.id} className={`
          border-l-4 transition-all
          ${order.status === 'pending' ? 'border-l-yellow-500 bg-yellow-50/50' : ''}
          ${order.status === 'preparing' ? 'border-l-blue-500 bg-blue-50/50' : ''}
          ${order.status === 'completed' ? 'border-l-green-500 bg-green-50/50' : ''}
        `}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-lg">{order.orderNumber}</span>
              <Badge className={`
                ${order.status === 'pending' ? 'bg-yellow-500' : ''}
                ${order.status === 'preparing' ? 'bg-blue-500' : ''}
                ${order.status === 'completed' ? 'bg-green-500' : ''}
                text-white
              `}>
                {order.status === 'pending' && <><Clock className="w-3 h-3 mr-1" />대기중</>}
                {order.status === 'preparing' && <><ChefHat className="w-3 h-3 mr-1" />준비중</>}
                {order.status === 'completed' && <><Check className="w-3 h-3 mr-1" />완료</>}
              </Badge>
            </div>
            
            <div className="space-y-1 mb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.menuName} × {item.quantity}</span>
                  <span className="text-slate-800">₩{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="font-bold text-lg">₩{order.totalAmount.toLocaleString()}</span>
              <div className="flex gap-2">
                {order.status !== 'completed' && (
                  <Button 
                    onClick={() => handleStatusChange(order)}
                    size="sm"
                    className={`
                      ${order.status === 'pending' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                      ${order.status === 'preparing' ? 'bg-green-500 hover:bg-green-600' : ''}
                    `}
                  >
                    {order.status === 'pending' && '준비 시작'}
                    {order.status === 'preparing' && '완료 처리'}
                  </Button>
                )}
                <Button 
                  onClick={() => handleDelete(order.id)}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
