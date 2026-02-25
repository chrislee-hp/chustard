import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/slices/authSlice';
import { validateLoginForm } from '../utils/validation';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate
    const errors = validateLoginForm(formData);
    if (errors.length > 0) {
      alert(errors.map(e => e.message).join('\n'));
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock API call
      const mockUser = {
        id: '1',
        storeId: formData.storeId,
        username: formData.username,
        role: 'admin' as const,
        createdAt: new Date().toISOString()
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      dispatch(loginSuccess({ user: mockUser, token: mockToken }));
      navigate('/admin/orders');
    } catch (error: any) {
      alert(error.message || '로그인 실패');
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
          <input
            name="storeId"
            value={formData.storeId}
            onChange={handleChange}
            placeholder="store-123"
          />
        </div>
        <div>
          <label>사용자명</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="admin"
          />
        </div>
        <div>
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
