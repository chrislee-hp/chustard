import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSSE } from '../hooks/useSSE';
import { API_BASE_URL, CONSTANTS } from '../config';

export default function OrderHistoryPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = localStorage.getItem(CONSTANTS.SESSION_ID_KEY);
  const token = localStorage.getItem(CONSTANTS.TOKEN_KEY);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!sessionId || !token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`${API_BASE_URL}/orders?sessionId=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(t('errorLoadingOrders') || '주문 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [sessionId, token]);

  useSSE(`${API_BASE_URL}/sse/orders?sessionId=${sessionId}&token=${token}`, (data) => {
    loadOrders();
  });

  const statusText = (status) => {
    const map = { pending: t('pending') || '대기중', preparing: t('preparing') || '준비중', completed: t('completed') || '완료' };
    return map[status] || status;
  };

  const name = (i) => (lang === 'en' ? i.nameEn : i.nameKo);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadOrders} style={{ padding: '8px 16px', marginTop: '12px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{t('orderHistory')}</h1>
        <button onClick={() => navigate('/menu')} style={{ padding: '8px 16px' }}>
          {t('back') || '뒤로'}
        </button>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>{t('noOrders') || '주문 내역이 없습니다.'}</p>
      ) : (
        orders.map(o => (
          <div
            key={o.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold' }}>{statusText(o.status)}</span>
              <span>{new Date(o.createdAt).toLocaleString()}</span>
            </div>
            {o.items?.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{name(i)} x {i.quantity}</span>
                <span>{(i.price * i.quantity).toLocaleString()}{t('won')}</span>
              </div>
            ))}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee', fontWeight: 'bold', textAlign: 'right' }}>
              {t('total')}: {o.totalAmount?.toLocaleString()}{t('won')}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
