import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTables, selectTable, openSidePanel } from '../store/slices/dashboardSlice';
import { TableCard } from './TableCard';
import { OrderDetailSidePanel } from './OrderDetailSidePanel';
import type { RootState, AppDispatch } from '../store/store';

export function OrderMonitoringTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { tables, sidePanelOpen, newOrderIds } = useSelector((state: RootState) => state.dashboard);
  
  useEffect(() => {
    dispatch(fetchTables());
    
    // Poll every 5 minutes
    const interval = setInterval(() => {
      dispatch(fetchTables());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleCardClick = (tableId: string) => {
    dispatch(selectTable(tableId));
    dispatch(openSidePanel());
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>주문 모니터링</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            isNew={newOrderIds.includes(table.id)}
            onClick={() => handleCardClick(table.id)}
          />
        ))}
      </div>
      
      {sidePanelOpen && <OrderDetailSidePanel />}
    </div>
  );
}
