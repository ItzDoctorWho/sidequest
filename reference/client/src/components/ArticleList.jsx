import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setArticles, setLoading, setError } from '../redux/articleSlice';
import ArticleCard from './ArticleCard';

export default function ArticleList() {
  const dispatch = useDispatch();

  // 1. Etat Global (Redux) : liste des articles, chargement et erreur
  const { items, loading, error } = useSelector((state) => state.articles);

  // 2. Etat Local (useState) : categorie selectionnee
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fonction simple pour charger les articles avec Axios et les ranger dans Redux
  const chargerArticles = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axiosClient.get('/articles');
      dispatch(setArticles(response.data));
    } catch (err) {
      dispatch(setError('Serveur Express injoignable sur http://localhost:5000.'));
    }
  };

  // Chargement initial a l'ouverture de la page
  useEffect(() => {
    chargerArticles();
  }, []);

  // Filtrage JavaScript simple
  const filteredItems = selectedCategory
    ? items.filter((a) => a.category === selectedCategory)
    : items;

  return (
    <section className="list-section">
      <div className="list-header">
        <div>
          <h3>Articles Synchronises avec l'API Express</h3>
          <p className="list-subtitle">
            Donnees recuperees via Axios depuis http://localhost:5000/api/articles
          </p>
        </div>

        <div className="filter-box">
          <label>Filtrer par domaine : </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tous les domaines</option>
            <option value="Architecture Web">Architecture Web</option>
            <option value="Base de Donnees">Base de Donnees</option>
            <option value="Cybersecurite">Cybersecurite</option>
            <option value="Intelligence Artificielle">Intelligence Artificielle</option>
            <option value="DevOps & Cloud">DevOps & Cloud</option>
          </select>
        </div>
      </div>

      {/* CAS 1 : Alerte en cas d'erreur reseau */}
      {error && (
        <div className="error-banner">
          <div className="error-icon">!</div>
          <div className="error-text">
            <strong>Erreur de Communication avec l'API Express :</strong>
            <p>{error}</p>
          </div>
          <button className="btn-retry" onClick={chargerArticles}>
            Reessayer
          </button>
        </div>
      )}

      {/* CAS 2 : Indicateur de chargement */}
      {loading && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Chargement des articles depuis l'API Express...</p>
        </div>
      )}

      {/* CAS 3 : Grille des articles */}
      {!loading && filteredItems.length > 0 && (
        <div className="articles-grid">
          {filteredItems.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
