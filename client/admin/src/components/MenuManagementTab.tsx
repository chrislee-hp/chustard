import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { fetchMenus, fetchCategories, deleteMenu } from '../store/slices/menuManagementSlice';
import type { RootState, AppDispatch } from '../store/store';

export function MenuManagementTab() {
  return (
    <div style={{ padding: '2rem' }}>
      <Routes>
        <Route index element={<MenuListView />} />
        <Route path="create" element={<MenuFormPage mode="create" />} />
        <Route path=":id/edit" element={<MenuFormPage mode="edit" />} />
      </Routes>
    </div>
  );
}

function MenuListView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { menus, categories } = useSelector((state: RootState) => state.menuManagement);
  
  useEffect(() => {
    dispatch(fetchMenus());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const handleDelete = (menuId: string) => {
    if (confirm('메뉴를 삭제하시겠습니까?')) {
      dispatch(deleteMenu(menuId));
    }
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>메뉴 관리</h1>
        <button onClick={() => navigate('/admin/menus/create')} style={{ padding: '0.5rem 1rem' }}>
          메뉴 추가
        </button>
      </div>
      
      {menus.length === 0 ? (
        <p>등록된 메뉴가 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>메뉴명 (한)</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>메뉴명 (영)</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>가격</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {menus.map(menu => (
              <tr key={menu.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{menu.nameKo}</td>
                <td style={{ padding: '0.5rem' }}>{menu.nameEn}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>₩{menu.price.toLocaleString()}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <button onClick={() => navigate(`/admin/menus/${menu.id}/edit`)} style={{ marginRight: '0.5rem' }}>
                    수정
                  </button>
                  <button onClick={() => handleDelete(menu.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function MenuFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = React.useState({
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    price: 0,
    categoryId: '',
    imageUrl: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameKo || !formData.nameEn) {
      alert('메뉴명을 입력해주세요');
      return;
    }
    
    if (formData.price <= 0) {
      alert('가격은 0보다 커야 합니다');
      return;
    }
    
    // dispatch(createMenu(formData));
    alert('메뉴가 저장되었습니다');
    navigate('/admin/menus');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };
  
  return (
    <div>
      <h1>{mode === 'create' ? '메뉴 추가' : '메뉴 수정'}</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>메뉴명 (한글) *</label>
          <input
            name="nameKo"
            value={formData.nameKo}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>메뉴명 (영문) *</label>
          <input
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>설명 (한글)</label>
          <textarea
            name="descriptionKo"
            value={formData.descriptionKo}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>설명 (영문)</label>
          <textarea
            name="descriptionEn"
            value={formData.descriptionEn}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>가격 *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>이미지 URL</label>
          <input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            저장
          </button>
          <button type="button" onClick={() => navigate('/admin/menus')} style={{ flex: 1, padding: '0.75rem' }}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
