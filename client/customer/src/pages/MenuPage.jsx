import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { API_BASE_URL, CONSTANTS } from '../config';

export default function MenuPage() {
  const { lang, t, toggle } = useLanguage();
  const { items, addItem, updateQty, clear, total } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const storeId = localStorage.getItem(CONSTANTS.STORE_ID_KEY);
        if (!storeId) throw new Error('Store ID not found');
        const res = await fetch(`${API_BASE_URL}/menus?storeId=${storeId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length) setActiveCat(data.categories[0].id);
      } catch (err) {
        setError('메뉴를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, [t]);

  const activeMenus = categories.find(c => c.id === activeCat)?.menus || [];
  const name = (m) => lang === 'en' ? m.nameEn : m.nameKo;
  const desc = (m) => lang === 'en' ? m.descEn : m.descKo;

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 메인 메뉴 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button onClick={toggle} aria-label={lang === 'ko' ? 'Switch to English' : '한국어로 변경'} style={{ padding: '8px 12px' }}>
            {lang === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English'}
          </button>
          <button onClick={() => navigate('/orders')} aria-label={t('orderHistory')} style={{ padding: '8px 12px' }}>
            {t('orderHistory')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '10px' }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} aria-pressed={c.id === activeCat}
              style={{ fontWeight: c.id === activeCat ? 'bold' : 'normal', padding: '8px 16px', border: c.id === activeCat ? '2px solid #000' : '1px solid #ccc', whiteSpace: 'nowrap' }}>
              {lang === 'en' && c.nameEn ? c.nameEn : c.name}
            </button>
          ))}
        </div>

        {activeMenus.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No menus available</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {activeMenus.map(m => (
              <div key={m.id} onClick={() => addItem(m)} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && addItem(m)}
                style={{ cursor: 'pointer', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '44px', opacity: m.isAvailable === 0 ? 0.4 : 1, pointerEvents: m.isAvailable === 0 ? 'none' : 'auto' }}>
                {m.imageUrl && <img src={m.imageUrl} alt={name(m)} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />}
                <div style={{ fontWeight: 'bold' }}>{name(m)}</div>
                {desc(m) && <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{desc(m)}</div>}
                <div style={{ marginTop: '4px' }}>{m.price.toLocaleString()}{t('won')}</div>
                {m.isAvailable === 0 && <div style={{ color: 'red', fontWeight: 'bold' }}>{lang === 'en' ? 'Sold Out' : '품절'}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FR-1.3: 우측 사이드 패널 장바구니 */}
      <div style={{ width: '320px', borderLeft: '2px solid #000', padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
        <h3 style={{ margin: '0 0 12px' }}>{t('cart')}</h3>
        {items.length === 0 ? (
          <p style={{ color: '#666' }}>{t('emptyCart')}</p>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {items.map(i => (
                <div key={i.menuId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ flex: 1 }}>{lang === 'en' ? i.nameEn : i.nameKo}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => updateQty(i.menuId, i.quantity - 1)} aria-label="Decrease quantity" style={{ padding: '4px 8px', minWidth: '32px', minHeight: '32px' }}>-</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => updateQty(i.menuId, i.quantity + 1)} aria-label="Increase quantity" style={{ padding: '4px 8px', minWidth: '32px', minHeight: '32px' }}>+</button>
                    <span style={{ minWidth: '70px', textAlign: 'right' }}>{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={clear} style={{ marginTop: '8px', padding: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
              {lang === 'en' ? 'Clear Cart' : '장바구니 비우기'}
            </button>
          </>
        )}
        <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: 'bold' }}>
          {t('total')}: {total.toLocaleString()}{t('won')}
        </div>
        <button onClick={() => navigate('/order/confirm')} disabled={items.length === 0}
          style={{ marginTop: '12px', width: '100%', padding: '14px', fontSize: '16px', backgroundColor: items.length === 0 ? '#ccc' : '#000', color: '#fff', border: 'none', cursor: items.length === 0 ? 'not-allowed' : 'pointer', minHeight: '48px' }}>
          {t('order')}
        </button>
      </div>
    </div>
  );
}
