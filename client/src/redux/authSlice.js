import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient.js';

// 1. Inscription
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/register', { name, email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

// 2. Connexion
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// 3. Charger le profil me
export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data.user;
    } catch (err) {
      return rejectWithValue({ message: err.message || 'Session expired', unauthorized: err.status === 401 });
    }
  }
);

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    // Instant feedback for XP changes. The server stays the source of truth: fetchMe reconciles right after.
    adjustXp: (state, action) => {
      if (!state.user) return;
      state.user.xp = Math.max(0, (state.user.xp || 0) + action.payload);
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // fetchMe
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchMe.rejected, (state, action) => {
        // Only sign out when the server says the session is invalid, not on a network hiccup.
        if (!action.payload?.unauthorized) return;
        state.user = null;
        state.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      });
  }
});

export const { logout, clearAuthError, adjustXp } = authSlice.actions;
export default authSlice.reducer;
