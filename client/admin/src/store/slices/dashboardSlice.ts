import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Table, Order } from '../../types';

interface DashboardState {
  tables: Table[];
  selectedTableId: string | null;
  sidePanelOpen: boolean;
  filterTableId: string | null;
  newOrderIds: Set<string>;
  loading: boolean;
}

const initialState: DashboardState = {
  tables: [],
  selectedTableId: null,
  sidePanelOpen: false,
  filterTableId: null,
  newOrderIds: new Set(),
  loading: false
};

export const fetchTables = createAsyncThunk(
  'dashboard/fetchTables',
  async () => {
    // Mock API call
    const mockTables: Table[] = [
      {
        id: '1',
        tableNumber: '1',
        isActive: true,
        currentSessionId: 'session-1',
        totalAmount: 45000,
        orderCount: 2,
        lastOrderAt: new Date().toISOString(),
        orders: []
      },
      {
        id: '2',
        tableNumber: '2',
        isActive: false,
        currentSessionId: null,
        totalAmount: 0,
        orderCount: 0,
        lastOrderAt: null,
        orders: []
      }
    ];
    return mockTables;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    selectTable: (state, action: PayloadAction<string>) => {
      state.selectedTableId = action.payload;
    },
    openSidePanel: (state) => {
      state.sidePanelOpen = true;
    },
    closeSidePanel: (state) => {
      state.sidePanelOpen = false;
      state.selectedTableId = null;
    },
    markOrderAsNew: (state, action: PayloadAction<string>) => {
      state.newOrderIds.add(action.payload);
    },
    clearNewOrderFlag: (state, action: PayloadAction<string>) => {
      state.newOrderIds.delete(action.payload);
    },
    orderReceived: (state, action: PayloadAction<Order>) => {
      const table = state.tables.find(t => t.id === action.payload.tableId);
      if (table) {
        table.orders.push(action.payload);
        table.orderCount++;
        table.totalAmount += action.payload.totalAmount;
        table.lastOrderAt = action.payload.createdAt;
      }
    },
    orderUpdated: (state, action: PayloadAction<Order>) => {
      const table = state.tables.find(t => t.id === action.payload.tableId);
      if (table) {
        const index = table.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          table.orders[index] = action.payload;
        }
      }
    },
    orderDeleted: (state, action: PayloadAction<{ orderId: string; tableId: string }>) => {
      const table = state.tables.find(t => t.id === action.payload.tableId);
      if (table) {
        const order = table.orders.find(o => o.id === action.payload.orderId);
        if (order) {
          table.totalAmount -= order.totalAmount;
          table.orderCount--;
          table.orders = table.orders.filter(o => o.id !== action.payload.orderId);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tables = action.payload;
        state.loading = false;
      })
      .addCase(fetchTables.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const {
  selectTable,
  openSidePanel,
  closeSidePanel,
  markOrderAsNew,
  clearNewOrderFlag,
  orderReceived,
  orderUpdated,
  orderDeleted
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
