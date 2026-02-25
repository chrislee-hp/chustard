import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTables, selectTable, openSidePanel } from '../store/slices/dashboardSlice';
import { TABLE_POLLING_INTERVAL_MS } from '../constants';
import { TableCard } from './TableCard';
import { OrderDetailSidePanel } from './OrderDetailSidePanel';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ClipboardList, RefreshCw } from 'lucide-react';
import type { RootState, AppDispatch } from '../store/store';

export function OrderMonitoringTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { tables, sidePanelOpen, newOrderIds } = useSelector((state: RootState) => state.dashboard);
  
  useEffect(() => {
    dispatch(fetchTables());
    const interval = setInterval(() => {
      dispatch(fetchTables());
    }, TABLE_POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleCardClick = (tableId: string) => {
    dispatch(selectTable(tableId));
    dispatch(openSidePanel());
  };

  const activeTables = tables.filter(t => t.isActive);
  
  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-admin flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">주문 모니터링</CardTitle>
                <p className="text-sm text-slate-500 mt-1">실시간 테이블 현황</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500 text-white px-3 py-1">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                LIVE
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                활성 테이블: {activeTables.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {tables.length === 0 ? (
        <Card className="glass-effect border-0 shadow-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">등록된 테이블이 없습니다</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              isNew={newOrderIds.includes(table.id)}
              onClick={() => handleCardClick(table.id)}
            />
          ))}
        </div>
      )}
      
      {sidePanelOpen && <OrderDetailSidePanel />}
    </div>
  );
}
