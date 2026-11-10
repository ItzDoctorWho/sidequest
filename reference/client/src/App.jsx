import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AuthCard from './components/AuthCard';
import ArticleForm from './components/ArticleForm';
import ArticleList from './components/ArticleList';

export default function App() {
  // On lit si un utilisateur est connecte dans le coffre Redux (state.auth)
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container main-content">
        <header className="page-intro">
          <h1>Authentification Full-Stack JWT &amp; Protection des Actions</h1>
          <p>
            Séance 6 Finale (Groupe Décalé) : <code>authSlice</code> + Intercepteur <code>Bearer Token</code> + Mise en Production Cloud.
          </p>
        </header>

        <div className="app-grid-layout">
          <div className="column-form">
            {/* Si connecte -> Formulaire d'ajout, sinon -> Carte de Connexion JWT */}
            {user ? <ArticleForm /> : <AuthCard />}
          </div>
          <div className="column-list">
            <ArticleList />
          </div>
        </div>
      </main>

      <footer className="footer-bar">
        <p>École Polytechnique de Sousse -- MERN Stack Groupe Décalé 2026-2027 -- Dr. Abdelweheb GUEDDES</p>
      </footer>
    </div>
  );
}
