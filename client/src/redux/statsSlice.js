import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient.js';

export const fetchStats = createAsyncThunk(
  'stats/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load stats');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    clearStatsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearStatsError } = statsSlice.actions;
export default statsSlice.reducer;

