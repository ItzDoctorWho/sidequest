import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { addArticle } from '../redux/articleSlice';

const CATEGORIES = [
  'Architecture Web', 'Base de Donnees', 'Cybersecurite',
  'Intelligence Artificielle', 'DevOps & Cloud'
];

export default function ArticleForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.articles);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorMsg('');
    setFeedback('');

    try {
      // 1. Envoyer l'article (l'intercepteur Axios ajoute automatiquement le Token JWT !)
      const response = await axiosClient.post('/articles', { title, category });

      // 2. Ranger l'article cree dans le Store Redux
      dispatch(addArticle(response.data));

      // 3. Vider le champ titre
      setTitle('');
      setFeedback('Article publie avec succes (Token JWT verifie par Express) !');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  };

  return (
    <section className="form-card unlocked-card">
      <div className="form-header">
        <span className="unlock-pill">Token JWT Actif -- Publication Autorisee</span>
        <h3>Publier un Nouvel Article</h3>
        <p>Auteur certifie par le Token JWT : <strong>{user?.name}</strong></p>
      </div>

      {feedback && <div className="feedback-alert success">{feedback}</div>}
      {errorMsg && <div className="feedback-alert error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-group">
          <label htmlFor="title">Titre de l'Article :</label>
          <input
            id="title"
            type="text"
            placeholder="Ex : Deploiement Cloud MERN sur Render & Vercel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categorie :</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          + Publier avec mon Token JWT
        </button>
      </form>
    </section>
  );
}
