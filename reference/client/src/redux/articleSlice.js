import { createSlice } from '@reduxjs/toolkit';

const articleSlice = createSlice({
  name: 'articles',
  initialState: {
    items: [],      // La liste des articles recus du serveur Express
    loading: false, // true pendant que la requete Axios est en cours
    error: null     // Message d'erreur si le serveur Express est eteint
  },
  reducers: {
    // 1. Remplir la liste quand Axios recoit les articles (GET)
    setArticles: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },

    // 2. Ajouter un nouvel article en tete de liste (POST)
    addArticle: (state, action) => {
      state.items.unshift(action.payload);
    },

    // 3. Supprimer un article par son identifiant (DELETE)
    removeArticle: (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },

    // 4. Activer/desactiver le chargement ou afficher une erreur
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setArticles,
  addArticle,
  removeArticle,
  setLoading,
  setError
} = articleSlice.actions;

export default articleSlice.reducer;
