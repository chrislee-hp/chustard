import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Menu, Category, MenuFormData } from '../../types';

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

export const fetchMenus = createAsyncThunk('menuManagement/fetchMenus', async () => {
  // Mock data
  return [];
});

export const fetchCategories = createAsyncThunk('menuManagement/fetchCategories', async () => {
  // Mock data
  return [];
});

export const createMenu = createAsyncThunk(
  'menuManagement/createMenu',
  async (menuData: MenuFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: Date.now().toString(),
      ...menuData,
      displayOrder: 0,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Menu;
  }
);

export const updateMenu = createAsyncThunk(
  'menuManagement/updateMenu',
  async ({ id, data }: { id: string; data: MenuFormData }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, ...data } as Menu;
  }
);

export const deleteMenu = createAsyncThunk(
  'menuManagement/deleteMenu',
  async (menuId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return menuId;
  }
);

const menuManagementSlice = createSlice({
  name: 'menuManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.menus = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createMenu.fulfilled, (state, action) => {
        state.menus.push(action.payload);
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.menus = state.menus.filter(m => m.id !== action.payload);
      });
  }
});

export default menuManagementSlice.reducer;
