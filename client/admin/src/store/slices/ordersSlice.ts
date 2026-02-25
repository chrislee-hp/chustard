import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderStatus } from '../../types';

interface OrdersState {
  orders: Record<string, Order>;
  loading: Record<string, boolean>;
}

const initialState: OrdersState = {
  orders: {},
  loading: {}
};

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { orderId, status };
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (orderId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return orderId;
  }
);

export const completeSession = createAsyncThunk(
  'orders/completeSession',
  async (tableId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return tableId;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateOrderStatus.pending, (state, action) => {
        state.loading[action.meta.arg.orderId] = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        if (state.orders[orderId]) {
          state.orders[orderId].status = status;
        }
        state.loading[orderId] = false;
      })
      .addCase(deleteOrder.pending, (state, action) => {
        state.loading[action.meta.arg] = true;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        delete state.orders[action.payload];
        delete state.loading[action.payload];
      });
  }
});

export default ordersSlice.reducer;
