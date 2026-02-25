import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../store/slices/authSlice';
import { validateLoginForm } from '../utils/validation';
import api from '../utils/api';
import type { LoginCredentials } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full gradient-admin flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-700">
            관리자 로그인
          </CardTitle>
          <p className="text-gray-600">매장 관리 시스템</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="storeId" className="text-sm font-semibold text-gray-700">매장 식별자</Label>
              <Input 
                id="storeId"
                name="storeId" 
                value={formData.storeId} 
                onChange={handleChange} 
                placeholder="store-123"
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">사용자명</Label>
              <Input 
                id="username"
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="admin"
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">비밀번호</Label>
              <Input 
                id="password"
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="********"
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 h-12"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              size="lg"
              className="w-full gradient-admin hover:opacity-90 transition-opacity shadow-lg text-lg font-bold h-14 mt-6"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
