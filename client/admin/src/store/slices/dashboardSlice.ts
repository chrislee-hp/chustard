import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { Table, Order } from '../../types';
import { updateOrderStatus, deleteOrder, completeSession } from './ordersSlice';

interface DashboardState {
  tables: Table[];
  selectedTableId: string | null;
  sidePanelOpen: boolean;
  filterTableId: string | null;
  newOrderIds: string[];
  loading: boolean;
}

const initialState: DashboardState = {
  tables: [],
  selectedTableId: null,
  sidePanelOpen: false,
  filterTableId: null,
  newOrderIds: [],
  loading: false
};

export const fetchTables = createAsyncThunk(
  'dashboard/fetchTables',
  async () => {
    const { data } = await api.get('/api/admin/orders');
    return data.tables as Table[];
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
      if (!state.newOrderIds.includes(action.payload)) {
        state.newOrderIds.push(action.payload);
      }
    },
    clearNewOrderFlag: (state, action: PayloadAction<string>) => {
      state.newOrderIds = state.newOrderIds.filter(id => id !== action.payload);
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
    orderUpdated: (state, action: PayloadAction<{ id: number | string; status: string }>) => {
      for (const table of state.tables) {
        const order = table.orders.find(o => String(o.id) === String(action.payload.id));
        if (order) {
          order.status = action.payload.status as Order['status'];
          break;
        }
      }
    },
    orderDeleted: (state, action: PayloadAction<{ orderId: string; tableId: string }>) => {
      for (const table of state.tables) {
        const order = table.orders.find(o => String(o.id) === String(action.payload.orderId));
        if (order) {
          table.totalAmount -= order.totalAmount;
          table.orderCount--;
          table.orders = table.orders.filter(o => String(o.id) !== String(action.payload.orderId));
          break;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => { state.loading = true; })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tables = action.payload;
        state.loading = false;
      })
      .addCase(fetchTables.rejected, (state) => { state.loading = false; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        for (const table of state.tables) {
          const order = table.orders.find(o => String(o.id) === String(orderId));
          if (order) {
            order.status = status;
            break;
          }
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        for (const table of state.tables) {
          const order = table.orders.find(o => String(o.id) === String(orderId));
          if (order) {
            table.totalAmount -= order.totalAmount;
            table.orderCount--;
            table.orders = table.orders.filter(o => String(o.id) !== String(orderId));
            break;
          }
        }
      })
      .addCase(completeSession.fulfilled, (state, action) => {
        const table = state.tables.find(t => t.id === action.payload);
        if (table) {
          table.isActive = false;
          table.currentSessionId = null;
          table.orders = [];
          table.orderCount = 0;
          table.totalAmount = 0;
        }
      });
  }
});

export const {
  selectTable, openSidePanel, closeSidePanel,
  markOrderAsNew, clearNewOrderFlag,
  orderReceived, orderUpdated, orderDeleted
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
