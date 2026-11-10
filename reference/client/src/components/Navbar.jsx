import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setArticles, setLoading, setError } from '../redux/articleSlice';
import { logout } from '../redux/authSlice';

export default function Navbar() {
  const { items, loading } = useSelector((state) => state.articles);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleRefresh = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axiosClient.get('/articles');
      dispatch(setArticles(response.data));
    } catch (err) {
      dispatch(setError('Serveur Express injoignable sur http://localhost:5000.'));
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="logo-icon">*</span>
        <div>
          <h2>DevBlog Full-Stack <span className="badge-track">Decale S6 Finale</span></h2>
          <span className="nav-sub">React 18 + Axios Interceptor + Auth JWT + Redux Toolkit</span>
        </div>
      </div>

      <div className="nav-stats">
        {user ? (
          <div className="user-badge connected">
            <span className="status-dot online"></span>
            <span><strong>{user.name}</strong> ({user.role})</span>
            <button className="btn-logout" onClick={() => dispatch(logout())}>
              Deconnexion
            </button>
          </div>
        ) : (
          <div className="user-badge visitor">
            <span className="status-dot offline"></span>
            <span>Mode Visiteur (Lecture seule)</span>
          </div>
        )}

        <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Chargement...' : 'Rafraichir'}
        </button>

        <div className="stat-pill">
          <span className="stat-label">Articles :</span>
          <span className="stat-count">{items.length}</span>
        </div>
      </div>
    </nav>
  );
}
