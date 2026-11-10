import { configureStore } from '@reduxjs/toolkit';
import articleReducer from './articleSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    articles: articleReducer, // Tiroir 1 : Liste des articles (Séance 5)
    auth: authReducer         // Tiroir 2 : Utilisateur connecté & Token JWT (Séance 6)
  }
});
