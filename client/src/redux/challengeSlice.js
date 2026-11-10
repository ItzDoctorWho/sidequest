import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient.js';

// Fetch current weekly challenge
export const fetchCurrentChallenge = createAsyncThunk(
  'challenge/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/challenges/current');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch challenge');
    }
  }
);

// Create new challenge
export const createChallenge = createAsyncThunk(
  'challenge/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/challenges', payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create challenge');
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenge',
  initialState: {
    current: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    clearChallengeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentChallenge
      .addCase(fetchCurrentChallenge.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchCurrentChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // createChallenge
      .addCase(createChallenge.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearChallengeError } = challengeSlice.actions;
export default challengeSlice.reducer;

