import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { fetchMenusAndCategories, deleteMenu, createMenu, updateMenu, toggleSoldOut } from '../store/slices/menuManagementSlice';
import type { RootState, AppDispatch } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, ChefHat } from 'lucide-react';

export function MenuManagementTab() {
  return (
    <Routes>
      <Route index element={<MenuListView />} />
      <Route path="create" element={<MenuFormPage mode="create" />} />
      <Route path=":id/edit" element={<MenuFormPage mode="edit" />} />
    </Routes>
  );
}

function MenuListView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { menus, categories } = useSelector((state: RootState) => state.menuManagement);
  
  useEffect(() => {
    dispatch(fetchMenusAndCategories());
  }, [dispatch]);
  
  const handleDelete = (menuId: string) => {
    if (confirm('메뉴를 삭제하시겠습니까?')) {
      dispatch(deleteMenu(menuId));
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-admin flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">메뉴 관리</CardTitle>
            </div>
            <Button 
              onClick={() => navigate('/admin/menus/create')}
              size="lg"
              className="gradient-admin hover:opacity-90 transition-opacity shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              메뉴 추가
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {menus.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">등록된 메뉴가 없습니다</p>
              <p className="text-gray-400 text-sm mt-2">메뉴 추가 버튼을 눌러 첫 메뉴를 등록하세요</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">메뉴명 (한)</TableHead>
                  <TableHead className="font-bold">메뉴명 (영)</TableHead>
                  <TableHead className="text-right font-bold">가격</TableHead>
                  <TableHead className="text-center font-bold">상태</TableHead>
                  <TableHead className="text-center font-bold w-32">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map(menu => (
                  <TableRow key={menu.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">{menu.nameKo}</TableCell>
                    <TableCell className="text-gray-600">{menu.nameEn}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-700">₩{menu.price.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        onClick={() => dispatch(toggleSoldOut({ id: menu.id, soldOut: !menu.soldOut }))}
                        variant={menu.soldOut ? "destructive" : "outline"}
                        size="sm"
                      >
                        {menu.soldOut ? '품절' : '판매중'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={() => navigate(`/admin/menus/${menu.id}/edit`)}
                          variant="outline"
                          size="sm"
                          className="border-slate-300 hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button 
                          onClick={() => handleDelete(menu.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MenuFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { menus, categories } = useSelector((state: RootState) => state.menuManagement);
  const menuId = window.location.pathname.split('/')[3];
  
  const [formData, setFormData] = React.useState({
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    price: 0,
    categoryId: '',
    imageUrl: ''
  });
  
  useEffect(() => {
    if (mode === 'edit' && menuId) {
      const menu = menus.find(m => m.id === menuId);
      if (menu) {
        setFormData({
          nameKo: menu.nameKo || '',
          nameEn: menu.nameEn || '',
          descriptionKo: menu.descKo || '',
          descriptionEn: menu.descEn || '',
          price: menu.price || 0,
          categoryId: menu.categoryId || '',
          imageUrl: menu.imageUrl || ''
        });
      }
    }
  }, [mode, menuId, menus]);
  
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
    
    const menuData = {
      nameKo: formData.nameKo,
      nameEn: formData.nameEn,
      descKo: formData.descriptionKo,
      descEn: formData.descriptionEn,
      price: formData.price,
      categoryId: formData.categoryId || (categories[0]?.id || ''),
      imageUrl: formData.imageUrl
    };
    
    try {
      if (mode === 'create') {
        await dispatch(createMenu(menuData)).unwrap();
      } else {
        await dispatch(updateMenu({ id: menuId, data: menuData })).unwrap();
      }
      alert('메뉴가 저장되었습니다');
      navigate('/admin/menus');
    } catch (err) {
      alert('저장에 실패했습니다');
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-admin flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {mode === 'create' ? '메뉴 추가' : '메뉴 수정'}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nameKo" className="text-sm font-semibold text-slate-700">
                  메뉴명 (한글) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nameKo"
                  name="nameKo"
                  value={formData.nameKo}
                  onChange={handleChange}
                  className="h-12 border-slate-300"
                  placeholder="예: 김치찌개"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nameEn" className="text-sm font-semibold text-slate-700">
                  메뉴명 (영문) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleChange}
                  className="h-12 border-slate-300"
                  placeholder="e.g. Kimchi Stew"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="descriptionKo" className="text-sm font-semibold text-slate-700">설명 (한글)</Label>
                <textarea
                  id="descriptionKo"
                  name="descriptionKo"
                  value={formData.descriptionKo}
                  onChange={handleChange}
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="메뉴 설명을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descriptionEn" className="text-sm font-semibold text-slate-700">설명 (영문)</Label>
                <textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleChange}
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Enter menu description"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-slate-700">
                  가격 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="h-12 border-slate-300"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-semibold text-slate-700">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="h-12 border-slate-300"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-6">
              <Button 
                type="submit"
                size="lg"
                className="flex-1 gradient-admin hover:opacity-90 transition-opacity shadow-lg font-semibold h-14"
              >
                저장
              </Button>
              <Button 
                type="button"
                onClick={() => navigate('/admin/menus')}
                variant="outline"
                size="lg"
                className="flex-1 border-2 border-slate-300 hover:bg-slate-100 font-semibold h-14"
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
