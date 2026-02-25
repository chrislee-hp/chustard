import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { Menu, Category, MenuFormData } from '../../types';
import type { RootState } from '../store';

interface MenuManagementState {
  menus: Menu[];
  categories: Category[];
  loading: boolean;
}

const initialState: MenuManagementState = {
  menus: [],
  categories: [],
  loading: false
};

export const fetchMenusAndCategories = createAsyncThunk(
  'menuManagement/fetchMenusAndCategories',
  async (_, { getState }) => {
    const storeId = (getState() as RootState).auth.user?.storeId || 'store-001';
    const { data } = await api.get(`/api/menus?storeId=${storeId}`);
    return { menus: (data.menus || []) as Menu[], categories: (data.categories || []) as Category[] };
  }
);

export const createMenu = createAsyncThunk(
  'menuManagement/createMenu',
  async (menuData: MenuFormData) => {
    const { data } = await api.post('/api/admin/menus', menuData);
    return data.menu as Menu;
  }
);

export const updateMenu = createAsyncThunk(
  'menuManagement/updateMenu',
  async ({ id, data: menuData }: { id: string; data: MenuFormData }) => {
    const { data } = await api.put(`/api/admin/menus/${id}`, menuData);
    return data.menu as Menu;
  }
);

export const deleteMenu = createAsyncThunk(
  'menuManagement/deleteMenu',
  async (menuId: string) => {
    await api.delete(`/api/admin/menus/${menuId}`);
    return menuId;
  }
);

const menuManagementSlice = createSlice({
  name: 'menuManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenusAndCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchMenusAndCategories.fulfilled, (state, action) => {
        state.menus = action.payload.menus;
        state.categories = action.payload.categories;
        state.loading = false;
      })
      .addCase(fetchMenusAndCategories.rejected, (state) => { state.loading = false; })
      .addCase(createMenu.fulfilled, (state, action) => {
        state.menus.push(action.payload);
      })
      .addCase(updateMenu.fulfilled, (state, action) => {
        const idx = state.menus.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.menus[idx] = action.payload;
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.menus = state.menus.filter(m => m.id !== action.payload);
      });
  }
});

export default menuManagementSlice.reducer;
