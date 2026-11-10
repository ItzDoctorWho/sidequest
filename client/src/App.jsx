import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import Toaster from './components/Toaster.jsx';
import { Sparkle } from './components/brand/Decor.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MyListPage from './pages/MyListPage.jsx';
import ChallengesPage from './pages/ChallengesPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { fetchMe } from './redux/authSlice.js';
import { applyTheme } from './redux/uiSlice.js';

export const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-list" element={<MyListPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
        </Routes>
      </main>
      <footer className="border-t border-line">
        <p className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-6 text-sm text-fg-muted sm:px-6">
          <Sparkle className="size-3.5 text-accent" />
          <span>
            <span className="font-display font-semibold text-fg">SideQuest</span> · Less scrolling. More doing.
          </span>
        </p>
      </footer>
      <Toaster />
    </div>
  );
};

export default App;
