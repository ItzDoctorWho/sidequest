import { createSlice } from '@reduxjs/toolkit';

// ============================================================================
// ÉTAPE 2 (Page 2 du support PDF) : Créer le Tiroir authSlice (Redux + localStorage)
// ============================================================================
const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null
  },
  reducers: {
    // 1. Enregistrer l'utilisateur et son token JWT après /api/auth/login
    loginSuccess: (state, action) => {
      // TODO (Étape 2 - Page 2) :
      // state.user = action.payload.user;
      // state.token = action.payload.token;
      // localStorage.setItem('user', JSON.stringify(action.payload.user));
      // localStorage.setItem('token', action.payload.token);
    },

    // 2. Déconnecter l'utilisateur et vider localStorage
    logout: (state) => {
      // TODO (Étape 2 - Page 2) :
      // state.user = null;
      // state.token = null;
      // localStorage.removeItem('user');
      // localStorage.removeItem('token');
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
