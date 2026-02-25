import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useSSE } from '../hooks/useSSE';
import { API_BASE_URL, CONSTANTS } from '../config';

export default function DashboardPage() {
  const { auth, fetchAuth } = useAdminAuth();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const newOrderIds = useRef(new Set());

  const loadOrders = useCallback(async () => {
    if (!auth?.storeId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAuth(`${API_BASE_URL}/admin/orders?storeId=${auth.storeId}`);
      const data = await res.json();
      const prev = new Set(tables.flatMap(t => t.orders?.map(o => o.id) || []));
      const newTables = data.tables || [];
      // 신규 주문 감지
      newTables.forEach(t => t.orders?.forEach(o => {
        if (!prev.has(o.id)) newOrderIds.current.add(o.id);
      }));
      setTables(newTables);
      // 5초 후 강조 해제
      if (newOrderIds.current.size > 0) {
        setTimeout(() => { newOrderIds.current.clear(); setTables(t => [...t]); }, 5000);
      }
    } catch (err) {
      setError('주문 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [auth?.storeId, fetchAuth]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useSSE(
    auth?.token ? `${API_BASE_URL}/sse/orders?storeId=${auth.storeId}&token=${auth.token}` : null,
    useCallback(() => loadOrders(), [loadOrders])
  );

  const updateStatus = async (orderId, status) => {
    try {
      await fetchAuth(`${API_BASE_URL}/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      await loadOrders();
      setSelectedOrder(null);
    } catch { alert('상태 변경에 실패했습니다.'); }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('주문을 삭제하시겠습니까?')) return;
    try {
      await fetchAuth(`${API_BASE_URL}/admin/orders/${orderId}`, { method: 'DELETE' });
      await loadOrders();
      setSelectedOrder(null);
    } catch { alert('주문 삭제에 실패했습니다.'); }
  };

  const completeTable = async (tableId) => {
    if (!confirm('테이블 이용을 완료하시겠습니까?')) return;
    try {
      await fetchAuth(`${API_BASE_URL}/admin/tables/${tableId}/complete`, { method: 'POST' });
      await loadOrders();
      setSelectedTable(null);
    } catch { alert('테이블 완료 처리에 실패했습니다.'); }
  };

  const nextStatus = { pending: 'preparing', preparing: 'completed' };
  const statusLabel = (s) => s === 'pending' ? '대기중' : s === 'preparing' ? '준비중' : '완료';

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center' }}><p style={{ color: 'red' }}>{error}</p><button onClick={loadOrders}>Retry</button></div>;

  // 선택된 테이블의 전체 주문
  const tableDetail = selectedTable ? tables.find(t => t.tableId === selectedTable) : null;

  return (
    <div>
      <h1>주문 대시보드</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {tables.map(t => (
          <div key={t.tableId} data-testid={`table-${t.tableNumber}`}
            onClick={() => { setSelectedTable(t.tableId); setSelectedOrder(null); }}
            style={{ border: '1px solid', padding: '12px', background: t.status === 'active' ? '#e8f5e9' : '#f5f5f5', cursor: 'pointer' }}>
            <h3>테이블 {t.tableNumber} {t.status === 'active' ? '🟢' : '⚪'}</h3>
            <p>총액: {t.totalAmount?.toLocaleString()}원</p>
            {/* FR-2.2: 최신 주문 5개만 미리보기 */}
            {t.orders?.slice(-5).map(o => (
              <div key={o.id} style={{
                padding: '4px', margin: '4px 0', background: newOrderIds.current.has(o.id) ? '#fff3cd' : '#fff',
                border: newOrderIds.current.has(o.id) ? '2px solid #ffc107' : 'none',
                animation: newOrderIds.current.has(o.id) ? 'pulse 1s ease-in-out 3' : 'none'
              }}>
                <span>{statusLabel(o.status)}</span>
                <span> {o.totalAmount?.toLocaleString()}원</span>
              </div>
            ))}
            {t.orders?.length > 5 && <div style={{ color: '#666', fontSize: '12px' }}>외 {t.orders.length - 5}건</div>}
            {t.status === 'active' && (
              <button onClick={(e) => { e.stopPropagation(); completeTable(t.tableId); }} style={{ marginTop: '8px' }}>이용 완료</button>
            )}
          </div>
        ))}
      </div>

      {/* FR-2.2: 테이블 카드 클릭 → 사이드 패널 주문 상세 */}
      {tableDetail && (
        <div data-testid="order-detail" style={{
          position: 'fixed', right: 0, top: 0, width: `${CONSTANTS.SIDEBAR_WIDTH}px`, height: '100%',
          background: '#fff', boxShadow: '-2px 0 8px rgba(0,0,0,.1)', padding: '16px', overflowY: 'auto', zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>테이블 {tableDetail.tableNumber} 주문 상세</h3>
            <button onClick={() => setSelectedTable(null)}>닫기</button>
          </div>
          <p>총 주문액: {tableDetail.totalAmount?.toLocaleString()}원</p>
          {tableDetail.orders?.map(o => (
            <div key={o.id} style={{
              padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '4px',
              background: selectedOrder?.id === o.id ? '#e3f2fd' : newOrderIds.current.has(o.id) ? '#fff3cd' : '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>{statusLabel(o.status)}</span>
                <span>{o.totalAmount?.toLocaleString()}원</span>
              </div>
              {o.items?.map(i => (
                <div key={i.id} style={{ fontSize: '14px', padding: '2px 0' }}>{i.nameKo} x{i.quantity} = {(i.price * i.quantity).toLocaleString()}원</div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {nextStatus[o.status] && (
                  <button onClick={() => updateStatus(o.id, nextStatus[o.status])} style={{ padding: '6px 12px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {nextStatus[o.status] === 'preparing' ? '준비 시작' : '완료 처리'}
                  </button>
                )}
                <button onClick={() => deleteOrder(o.id)} style={{ padding: '6px 12px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
