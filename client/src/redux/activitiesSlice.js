import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient.js';
import { adjustXp, fetchMe } from './authSlice.js';

// Fetch user activities
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/activities', { params: filters });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch activities');
    }
  }
);

// Save suggestion OR custom activity
export const saveActivity = createAsyncThunk(
  'activities/saveActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/activities', activityData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save activity');
    }
  }
);

// Mirrors the server's reward per completed quest (activityController). The server remains
// authoritative: fetchMe below replaces this estimate, including the weekly-challenge bonus.
const XP_PER_QUEST = 15;

// Update status, notes, or rating
export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ id, updates }, { rejectWithValue, dispatch, getState }) => {
    try {
      const previous = getState().activities.items.find((item) => item._id === id);
      const response = await axiosClient.patch(`/activities/${id}`, updates);

      // XP lives on the user, so keep it in step whenever a quest is completed or un-completed,
      // whichever screen triggered it.
      const wasDone = previous?.status === 'done';
      const isDone = response.data.status === 'done';
      if (previous && wasDone !== isDone) {
        dispatch(adjustXp(isDone ? XP_PER_QUEST : -XP_PER_QUEST));
        dispatch(fetchMe());
      } else if (!previous && updates.status !== undefined) {
        dispatch(fetchMe()); // not in the store, so we can't estimate: just ask the server
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update activity');
    }
  }
);

// Delete activity
export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/activities/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete activity');
    }
  }
);

const activitiesSlice = createSlice({
  name: 'activities',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    activeTab: 'saved' // 'saved' | 'done' | 'skipped'
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearActivitiesError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchActivities
      .addCase(fetchActivities.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // saveActivity
      .addCase(saveActivity.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // updateActivity
      .addCase(updateActivity.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // deleteActivity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  }
});

export const { setActiveTab, clearActivitiesError } = activitiesSlice.actions;
export default activitiesSlice.reducer;

