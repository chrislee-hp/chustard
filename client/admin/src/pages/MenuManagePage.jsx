import { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { API_BASE_URL } from '../config';

export default function MenuManagePage() {
  const { auth, fetchAuth } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', nameEn: '' });
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [menuForm, setMenuForm] = useState({ categoryId: '', nameKo: '', nameEn: '', descKo: '', descEn: '', price: '', imageUrl: '' });
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editMenu, setEditMenu] = useState(null);
  const [formError, setFormError] = useState('');

  const loadMenus = async () => {
    if (!auth?.storeId) return;
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_BASE_URL}/menus?storeId=${auth.storeId}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { setError('메뉴를 불러올 수 없습니다.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadMenus(); }, [auth?.storeId]);

  // 카테고리 CRUD
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) { setFormError('카테고리 이름은 필수입니다.'); return; }
    setFormError('');
    try {
      if (editCat) {
        await fetchAuth(`${API_BASE_URL}/admin/categories/${editCat.id}`, { method: 'PUT', body: JSON.stringify({ name: catForm.name, nameEn: catForm.nameEn }) });
      } else {
        await fetchAuth(`${API_BASE_URL}/admin/categories`, { method: 'POST', body: JSON.stringify({ name: catForm.name, nameEn: catForm.nameEn }) });
      }
      setCatForm({ name: '', nameEn: '' }); setShowCatForm(false); setEditCat(null);
      await loadMenus();
    } catch { alert('카테고리 저장에 실패했습니다.'); }
  };

  const handleCatDelete = async (id) => {
    if (!confirm('카테고리를 삭제하시겠습니까? 하위 메뉴도 삭제됩니다.')) return;
    try { await fetchAuth(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' }); await loadMenus(); }
    catch { alert('카테고리 삭제에 실패했습니다.'); }
  };

  const startEditCat = (cat) => { setEditCat(cat); setCatForm({ name: cat.name, nameEn: cat.nameEn || '' }); setShowCatForm(true); setFormError(''); };

  // 메뉴 CRUD
  const validateMenuForm = () => {
    if (!menuForm.categoryId) return '카테고리를 선택해주세요.';
    if (!menuForm.nameKo.trim()) return '메뉴명(한국어)은 필수입니다.';
    if (!menuForm.nameEn.trim()) return '메뉴명(영어)은 필수입니다.';
    const price = Number(menuForm.price);
    if (!menuForm.price || isNaN(price) || price < 100 || price > 1000000) return '가격은 100~1,000,000원 범위여야 합니다.';
    return '';
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const err = validateMenuForm();
    if (err) { setFormError(err); return; }
    setFormError('');
    const body = { ...menuForm, price: Number(menuForm.price) };
    try {
      if (editMenu) {
        await fetchAuth(`${API_BASE_URL}/admin/menus/${editMenu.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await fetchAuth(`${API_BASE_URL}/admin/menus`, { method: 'POST', body: JSON.stringify(body) });
      }
      resetMenuForm(); await loadMenus();
    } catch { alert('메뉴 저장에 실패했습니다.'); }
  };

  const handleMenuDelete = async (id) => {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return;
    try { await fetchAuth(`${API_BASE_URL}/admin/menus/${id}`, { method: 'DELETE' }); await loadMenus(); }
    catch { alert('메뉴 삭제에 실패했습니다.'); }
  };

  const startEditMenu = (m) => {
    setEditMenu(m);
    setMenuForm({ categoryId: m.categoryId, nameKo: m.nameKo, nameEn: m.nameEn, descKo: m.descKo || '', descEn: m.descEn || '', price: String(m.price), imageUrl: m.imageUrl || '' });
    setShowMenuForm(true); setFormError('');
  };

  const resetMenuForm = () => { setMenuForm({ categoryId: '', nameKo: '', nameEn: '', descKo: '', descEn: '', price: '', imageUrl: '' }); setShowMenuForm(false); setEditMenu(null); setFormError(''); };

  const toggleAvailable = async (menu) => {
    try { await fetchAuth(`${API_BASE_URL}/admin/menus/${menu.id}`, { method: 'PUT', body: JSON.stringify({ isAvailable: !menu.isAvailable }) }); await loadMenus(); }
    catch { alert('상태 변경에 실패했습니다.'); }
  };

  // FR-2.4: 순서 조정
  const reorderCat = async (idx, dir) => {
    const ids = categories.map(c => c.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    try { await fetchAuth(`${API_BASE_URL}/admin/categories/reorder`, { method: 'PUT', body: JSON.stringify({ categoryIds: ids }) }); await loadMenus(); }
    catch { alert('순서 변경에 실패했습니다.'); }
  };

  const reorderMenu = async (cat, menuIdx, dir) => {
    const ids = cat.menus.map(m => m.id);
    const newIdx = menuIdx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[menuIdx], ids[newIdx]] = [ids[newIdx], ids[menuIdx]];
    try { await fetchAuth(`${API_BASE_URL}/admin/menus/reorder`, { method: 'PUT', body: JSON.stringify({ menuIds: ids }) }); await loadMenus(); }
    catch { alert('순서 변경에 실패했습니다.'); }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center' }}><p style={{ color: 'red' }}>{error}</p><button onClick={loadMenus}>Retry</button></div>;

  const inputStyle = { display: 'block', padding: '8px', marginTop: '4px', width: '100%', boxSizing: 'border-box' };
  const btnPrimary = { padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const btnDanger = { padding: '4px 12px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
  const btnSmall = { padding: '4px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', backgroundColor: '#fff' };
  const btnArrow = { padding: '2px 8px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#fff' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>메뉴 관리</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setShowCatForm(!showCatForm); setEditCat(null); setCatForm({ name: '', nameEn: '' }); setFormError(''); }} style={{ ...btnPrimary, backgroundColor: '#2196f3' }}>
            {showCatForm ? '취소' : '+ 카테고리'}
          </button>
          <button onClick={() => { if (showMenuForm) { resetMenuForm(); } else { setShowMenuForm(true); setEditMenu(null); setMenuForm({ categoryId: '', nameKo: '', nameEn: '', descKo: '', descEn: '', price: '', imageUrl: '' }); setFormError(''); } }} style={{ ...btnPrimary, backgroundColor: '#4caf50' }}>
            {showMenuForm ? '취소' : '+ 메뉴'}
          </button>
        </div>
      </div>

      {formError && <div style={{ color: 'red', padding: '8px 12px', backgroundColor: '#fee', borderRadius: '4px', marginBottom: '12px' }}>{formError}</div>}

      {showCatForm && (
        <form onSubmit={handleCatSubmit} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }}>
          <h3>{editCat ? '카테고리 수정' : '카테고리 추가'}</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <label style={{ flex: 1 }}>이름 (한국어)<input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required style={inputStyle} /></label>
            <label style={{ flex: 1 }}>Name (English)<input value={catForm.nameEn} onChange={e => setCatForm({ ...catForm, nameEn: e.target.value })} style={inputStyle} /></label>
            <button type="submit" style={btnPrimary}>{editCat ? '수정' : '추가'}</button>
          </div>
        </form>
      )}

      {showMenuForm && (
        <form onSubmit={handleMenuSubmit} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }}>
          <h3>{editMenu ? '메뉴 수정' : '메뉴 추가'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>카테고리
              <select value={menuForm.categoryId} onChange={e => setMenuForm({ ...menuForm, categoryId: e.target.value })} required style={inputStyle}>
                <option value="">선택</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>가격 (원)<input type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} required min="100" max="1000000" style={inputStyle} /></label>
            <label>메뉴명 (한국어)<input value={menuForm.nameKo} onChange={e => setMenuForm({ ...menuForm, nameKo: e.target.value })} required style={inputStyle} /></label>
            <label>Menu Name (English)<input value={menuForm.nameEn} onChange={e => setMenuForm({ ...menuForm, nameEn: e.target.value })} required style={inputStyle} /></label>
            <label>설명 (한국어)<input value={menuForm.descKo} onChange={e => setMenuForm({ ...menuForm, descKo: e.target.value })} style={inputStyle} /></label>
            <label>Description (English)<input value={menuForm.descEn} onChange={e => setMenuForm({ ...menuForm, descEn: e.target.value })} style={inputStyle} /></label>
            <label style={{ gridColumn: '1 / -1' }}>이미지 URL<input value={menuForm.imageUrl} onChange={e => setMenuForm({ ...menuForm, imageUrl: e.target.value })} style={inputStyle} placeholder="https://..." /></label>
          </div>
          <button type="submit" style={{ ...btnPrimary, marginTop: '12px' }}>{editMenu ? '수정' : '추가'}</button>
        </form>
      )}

      {categories.map((cat, catIdx) => (
        <div key={cat.id} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <button onClick={() => reorderCat(catIdx, -1)} disabled={catIdx === 0} style={btnArrow}>▲</button>
            <button onClick={() => reorderCat(catIdx, 1)} disabled={catIdx === categories.length - 1} style={btnArrow}>▼</button>
            <h2 style={{ margin: 0 }}>{cat.name}</h2>
            {cat.nameEn && <span style={{ color: '#666' }}>({cat.nameEn})</span>}
            <button onClick={() => startEditCat(cat)} style={btnSmall}>수정</button>
            <button onClick={() => handleCatDelete(cat.id)} style={btnDanger}>삭제</button>
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {cat.menus?.map((m, mIdx) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', opacity: m.isAvailable === 0 ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => reorderMenu(cat, mIdx, -1)} disabled={mIdx === 0} style={{ ...btnArrow, padding: '0 6px', fontSize: '10px' }}>▲</button>
                    <button onClick={() => reorderMenu(cat, mIdx, 1)} disabled={mIdx === cat.menus.length - 1} style={{ ...btnArrow, padding: '0 6px', fontSize: '10px' }}>▼</button>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{m.nameKo}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{m.nameEn}</div>
                    <div>{m.price.toLocaleString()}원</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEditMenu(m)} style={btnSmall}>수정</button>
                  <button onClick={() => toggleAvailable(m)} style={{ ...btnSmall, backgroundColor: m.isAvailable === 0 ? '#4caf50' : '#ff9800', color: '#fff', border: 'none' }}>
                    {m.isAvailable === 0 ? '판매' : '품절'}
                  </button>
                  <button onClick={() => handleMenuDelete(m.id)} style={btnDanger}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
