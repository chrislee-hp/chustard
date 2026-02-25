import { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { API_BASE_URL } from '../config';

export default function OrderHistoryPage() {
  const { auth, fetchAuth } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const loadHistory = async (date) => {
    if (!auth?.storeId) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ storeId: auth.storeId });
      if (date) params.set('date', date);
      const res = await fetchAuth(`${API_BASE_URL}/admin/orders/history?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setError('주문 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(dateFilter); }, [auth?.storeId, dateFilter]);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center' }}><p style={{ color: 'red' }}>{error}</p><button onClick={() => loadHistory(dateFilter)}>Retry</button></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>주문 내역</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label>날짜 필터: <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '6px' }} /></label>
          {dateFilter && <button onClick={() => setDateFilter('')} style={{ padding: '6px 12px' }}>초기화</button>}
        </div>
      </div>
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>주문 내역이 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map(o => (
            <div key={o.id} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>테이블 {o.tableNumber}</span>
                <span>{new Date(o.completedAt || o.createdAt).toLocaleString()}</span>
              </div>
              {o.items?.map((i, idx) => (
                <div key={idx} style={{ fontSize: '14px', color: '#666' }}>{i.nameKo} x{i.quantity}</div>
              ))}
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>총액: {o.totalAmount?.toLocaleString()}원</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
