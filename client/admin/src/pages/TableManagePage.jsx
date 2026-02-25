import { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { API_BASE_URL } from '../config';

export default function TableManagePage() {
  const { auth, fetchAuth } = useAdminAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', password: '' });

  const loadTables = async () => {
    if (!auth?.storeId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAuth(`${API_BASE_URL}/admin/tables?storeId=${auth.storeId}`);
      const data = await res.json();
      setTables(data.tables || []);
    } catch (err) {
      setError('테이블 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTables(); }, [auth?.storeId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetchAuth(`${API_BASE_URL}/admin/tables`, {
        method: 'POST',
        body: JSON.stringify({ storeId: auth.storeId, tableNumber: Number(form.tableNumber), password: form.password }),
      });
      setForm({ tableNumber: '', password: '' });
      setShowForm(false);
      await loadTables();
    } catch (err) {
      alert('테이블 추가에 실패했습니다.');
    }
  };

  const handleComplete = async (tableId) => {
    if (!confirm('테이블 이용을 완료하시겠습니까?')) return;
    try {
      await fetchAuth(`${API_BASE_URL}/admin/tables/${tableId}/complete`, { method: 'POST' });
      await loadTables();
    } catch (err) {
      alert('테이블 완료 처리에 실패했습니다.');
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center' }}><p style={{ color: 'red' }}>{error}</p><button onClick={loadTables}>Retry</button></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>테이블 관리</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showForm ? '취소' : '+ 테이블 추가'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <label>
            테이블 번호
            <input type="number" value={form.tableNumber} onChange={e => setForm({ ...form, tableNumber: e.target.value })} required min="1" style={{ display: 'block', padding: '8px', marginTop: '4px' }} />
          </label>
          <label>
            비밀번호
            <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={4} style={{ display: 'block', padding: '8px', marginTop: '4px' }} />
          </label>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>추가</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {tables.map(t => (
          <div key={t.id} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}>
            <h3>테이블 {t.tableNumber}</h3>
            <p>상태: {t.status === 'active' ? '🟢 사용중' : '⚪ 대기'}</p>
            {t.status === 'active' && (
              <button onClick={() => handleComplete(t.id)} style={{ padding: '8px 16px', marginTop: '8px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                이용 완료
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
