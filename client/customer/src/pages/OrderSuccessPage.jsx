import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export default function OrderSuccessPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => setCount(c => c - 1), 1000);
    const redirect = setTimeout(() => navigate('/menu'), 5000);
    return () => { clearInterval(timer); clearTimeout(redirect); };
  }, [navigate]);

  const name = (i) => lang === 'en' ? i.nameEn : i.nameKo;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <h1>✅ {t('orderSuccess')}</h1>
      {order && (
        <div style={{ textAlign: 'left', margin: '20px 0', padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>{lang === 'en' ? 'Order #' : '주문번호: '}{order.id?.slice(0, 8)}</p>
          {order.items?.map(i => (
            <div key={i.id || i.menuId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{name(i)} x {i.quantity}</span>
              <span>{(i.price * i.quantity).toLocaleString()}{t('won')}</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #eee', fontWeight: 'bold', textAlign: 'right' }}>
            {t('total')}: {order.totalAmount?.toLocaleString()}{t('won')}
          </div>
        </div>
      )}
      <p>{count}{t('redirecting')}</p>
    </div>
  );
}
