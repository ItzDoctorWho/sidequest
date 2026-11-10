import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient.js';

// How many quests we keep ready behind the one on screen.
const QUEUE_TARGET = 2;
// Remember recent quests so a prefetched card never repeats one we just showed.
const SEEN_LIMIT = 40;
// A little extra work per prefetch is cheaper than showing a duplicate.
const DUPLICATE_RETRIES = 2;

export const filtersKey = (filters = {}) => `${filters.type || ''}|${filters.participants || ''}|${filters.maxDuration || ''}`;

const toParams = (filters = {}) => {
  const params = {};
  if (filters.type) params.type = filters.type;
  if (filters.participants) params.participants = filters.participants;
  if (filters.maxDuration) params.maxDuration = filters.maxDuration;
  return params;
};

const requestRandom = async (filters) => {
  const response = await axiosClient.get('/suggestions/random', { params: toParams(filters) });
  return response.data;
};

const identify = (activity) => activity?.key ?? activity?.activity;

const isDuplicate = (state, activity) => {
  const id = identify(activity);
  return (
    state.seen.includes(id) ||
    identify(state.current) === id ||
    state.queue.some((queued) => identify(queued) === id)
  );
};

/** Load a quest over the network and show a spinner while we wait. */
export const fetchRandomSuggestion = createAsyncThunk(
  'suggestion/fetchRandom',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await requestRandom(filters);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch suggestion');
    }
  }
);

/** Quietly fetch one quest into the queue. Never shows an error: the next real request will. */
export const prefetchSuggestion = createAsyncThunk(
  'suggestion/prefetch',
  async (filters = {}, { getState }) => {
    for (let attempt = 0; attempt <= DUPLICATE_RETRIES; attempt++) {
      const activity = await requestRandom(filters);
      if (!isDuplicate(getState().suggestion, activity)) {
        return { key: filtersKey(filters), activity };
      }
    }
    return null;
  },
  {
    condition: (filters = {}, { getState }) => {
      const { prefetching, queue, queueKey } = getState().suggestion;
      if (prefetching) return false;
      return queueKey !== filtersKey(filters) || queue.length < QUEUE_TARGET;
    }
  }
);

/** Top the queue up, one request at a time, until it is full or a request fails. */
export const fillQueue = (filters) => async (dispatch, getState) => {
  const { current } = getState().suggestion;
  if (!current) return;
  const result = await dispatch(prefetchSuggestion(filters));
  if (prefetchSuggestion.fulfilled.match(result) && result.payload) {
    dispatch(fillQueue(getState().suggestion.filters));
  }
};

/** Show the next quest instantly from the queue when we have one, otherwise go to the network. */
export const showNextSuggestion = (filters = {}) => (dispatch, getState) => {
  const { queue, queueKey } = getState().suggestion;
  if (queue.length && queueKey === filtersKey(filters)) {
    dispatch(showQueued());
    return Promise.resolve();
  }
  return dispatch(fetchRandomSuggestion(filters));
};

export const browseSuggestions = createAsyncThunk(
  'suggestion/browse',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/suggestions/browse', { params: toParams(filters) });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to browse suggestions');
    }
  }
);

const remember = (state, activity) => {
  const id = identify(activity);
  if (id === undefined || state.seen.includes(id)) return;
  state.seen.push(id);
  if (state.seen.length > SEEN_LIMIT) state.seen.shift();
};

const suggestionSlice = createSlice({
  name: 'suggestion',
  initialState: {
    current: null,
    currentSource: 'network', // 'network' | 'queue': queued cards skip the entrance animation
    queue: [],
    queueKey: '',
    prefetching: false,
    seen: [],
    browseList: [],
    filters: {
      type: '',
      participants: '',
      maxDuration: '' // '' | 'minutes' (activities that take under an hour)
    },
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    browseStatus: 'idle',
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { type: '', participants: '', maxDuration: '' };
    },
    clearCurrentSuggestion: (state) => {
      state.current = null;
      state.error = null;
      state.status = 'idle';
      state.queue = [];
    },
    showQueued: (state) => {
      const [next, ...rest] = state.queue;
      if (!next) return;
      state.queue = rest;
      state.current = next;
      state.currentSource = 'queue';
      state.status = 'succeeded';
      state.error = null;
      remember(state, next);
    },
    // A quest we couldn't save goes back to the front of the line instead of disappearing.
    restoreSuggestion: (state, action) => {
      const key = filtersKey(state.filters);
      if (state.queueKey !== key) {
        state.queue = [];
        state.queueKey = key;
      }
      state.queue.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Random suggestion
      .addCase(fetchRandomSuggestion.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        const key = filtersKey(action.meta.arg);
        if (state.queueKey !== key) {
          state.queue = [];
          state.queueKey = key;
        }
      })
      .addCase(fetchRandomSuggestion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
        state.currentSource = 'network';
        remember(state, action.payload);
      })
      .addCase(fetchRandomSuggestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.current = null;
      })
      // Prefetch
      .addCase(prefetchSuggestion.pending, (state, action) => {
        state.prefetching = true;
        const key = filtersKey(action.meta.arg);
        if (state.queueKey !== key) {
          state.queue = [];
          state.queueKey = key;
        }
      })
      .addCase(prefetchSuggestion.fulfilled, (state, action) => {
        state.prefetching = false;
        const result = action.payload;
        // Ignore results that arrived after the filters changed.
        if (!result || result.key !== state.queueKey || isDuplicate(state, result.activity)) return;
        state.queue.push(result.activity);
      })
      .addCase(prefetchSuggestion.rejected, (state) => {
        state.prefetching = false;
      })
      // Browse suggestions
      .addCase(browseSuggestions.pending, (state) => {
        state.browseStatus = 'loading';
        state.error = null;
      })
      .addCase(browseSuggestions.fulfilled, (state, action) => {
        state.browseStatus = 'succeeded';
        state.browseList = action.payload;
      })
      .addCase(browseSuggestions.rejected, (state, action) => {
        state.browseStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearCurrentSuggestion, showQueued, restoreSuggestion } =
  suggestionSlice.actions;
export default suggestionSlice.reducer;
