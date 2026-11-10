import { createSlice, nanoid } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Reducers stay pure. The DOM and localStorage are synced in <App /> (see applyTheme).
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    // { id, message, tone: 'info' | 'error', action?: { label, type, activityId } }
    toasts: []
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    addToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
      },
      prepare: (toast) => ({ payload: { id: nanoid(), tone: 'info', ...toast } })
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const { toggleTheme, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;

// Side effect kept outside the reducer. Suppresses transitions for one frame on switch.
export const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  // Force a style flush, then restore transitions on the next frame.
  void root.offsetHeight;
  requestAnimationFrame(() => root.classList.remove('theme-switching'));
};
