import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import uiReducer from './uiSlice.js';
import suggestionReducer from './suggestionSlice.js';
import activitiesReducer from './activitiesSlice.js';
import challengeReducer from './challengeSlice.js';
import statsReducer from './statsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    suggestion: suggestionReducer,
    activities: activitiesReducer,
    challenge: challengeReducer,
    stats: statsReducer
  }
});

export default store;

