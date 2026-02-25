import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../store/slices/authSlice';
import { validateLoginForm } from '../utils/validation';
import api from '../utils/api';
import type { LoginCredentials } from '../types';

export function LoginPage() {
  const [formData, setFormData] = useState<LoginCredentials>({
    storeId: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateLoginForm(formData);
    if (errors.length > 0) {
      alert(errors.map(e => e.message).join('\n'));
      return;
    }
    
    setIsLoading(true);
    try {
      const { data } = await api.post('/api/admin/login', formData);
      const user = { id: 'admin-001', storeId: formData.storeId, username: formData.username, role: 'admin' as const, createdAt: new Date().toISOString() };
      dispatch(loginSuccess({ user, token: data.token }));
      navigate('/admin/orders');
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const message = status === 423
        ? '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.'
        : '로그인에 실패했습니다. 매장ID, 사용자명, 비밀번호를 확인해주세요.';
      dispatch(loginFailure(message));
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <h1>관리자 로그인</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>매장 식별자</label>
          <input name="storeId" value={formData.storeId} onChange={handleChange} placeholder="store-123" />
        </div>
        <div>
          <label>사용자명</label>
          <input name="username" value={formData.username} onChange={handleChange} placeholder="admin" />
        </div>
        <div>
          <label>비밀번호</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
