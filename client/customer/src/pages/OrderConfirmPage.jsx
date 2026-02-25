import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { API_BASE_URL, CONSTANTS } from '../config';

export default function OrderConfirmPage() {
  const { lang, t } = useLanguage();
  const { items, clear, total } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items.length, navigate]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(CONSTANTS.TOKEN_KEY);
      const sessionId = localStorage.getItem(CONSTANTS.SESSION_ID_KEY);

      if (!token || !sessionId) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          items: items.map(i => ({ menuId: i.menuId, quantity: i.quantity })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      clear();
      navigate('/order/success', { state: { order: data.order } });
    } catch (err) {
      console.error('Order failed:', err);
      setError(err.message || t('orderFailed') || '주문에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const name = (i) => (lang === 'en' ? i.nameEn : i.nameKo);

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h1>{t('confirmOrder') || '주문 확인'}</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '12px', backgroundColor: '#fee', marginBottom: '16px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        {items.map(i => (
          <div
            key={i.menuId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              borderBottom: '1px solid #eee',
            }}
          >
            <span>{name(i)} x {i.quantity}</span>
            <span>{(i.price * i.quantity).toLocaleString()}{t('won')}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'right' }}>
        {t('total')}: {total.toLocaleString()}{t('won')}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate('/menu')}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#fff',
            border: '1px solid #000',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {t('back') || '뒤로'}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#000',
            color: '#fff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : (t('confirm') || '확인')}
        </button>
      </div>
    </div>
  );
}
