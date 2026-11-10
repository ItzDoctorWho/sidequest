import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { removeArticle } from '../redux/articleSlice';

export default function ArticleCard({ article }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleDelete = async () => {
    try {
      // 1. Supprimer sur Express (le Token JWT est ajoute automatiquement par l'intercepteur)
      await axiosClient.delete(`/articles/${article.id}`);
      // 2. Retirer du Store Redux
      dispatch(removeArticle(article.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Action non autorisee.');
    }
  };

  return (
    <article className="article-card">
      <div className="card-top">
        <span className="badge-category">{article.category}</span>
        {user ? (
          <button className="btn-delete" onClick={handleDelete}>
            Supprimer
          </button>
        ) : (
          <span className="locked-tag">Lecture seule (JWT requis)</span>
        )}
      </div>

      <h3 className="article-title">{article.title}</h3>

      <div className="card-footer">
        <span className="author-info">Auteur certifie : <strong>{article.author}</strong></span>
      </div>
    </article>
  );
}
