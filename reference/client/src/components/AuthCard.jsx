import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { loginSuccess } from '../redux/authSlice';

export default function AuthCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // ==========================================================================
  // ÉTAPE 4 (Page 4 du support PDF) : Connecter l'utilisateur en 2 lignes
  // ==========================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      // TODO (Étape 4 - Page 4) :
      // 1. Envoyer email + mot de passe au serveur Express :
      //    const response = await axiosClient.post('/auth/login', { email, password });
      // 2. Ranger l'utilisateur et son Token JWT dans Redux + localStorage :
      //    dispatch(loginSuccess(response.data));
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Erreur de connexion au serveur Express.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('gueddes@poly.tn');
    setPassword('123456');
    setErrorMsg('');
  };

  return (
    <section className="form-card auth-card">
      <div className="form-header">
        <span className="lock-pill">Espace Membre Securise (JWT)</span>
        <h3>Connexion Requise pour Publier</h3>
        <p>Connectez-vous pour obtenir votre Token JWT et debloquer l'ajout/suppression.</p>
      </div>

      {errorMsg && <div className="feedback-alert error">{errorMsg}</div>}

      <form onSubmit={handleLogin} className="article-form">
        <div className="form-group">
          <label htmlFor="email">Adresse Email :</label>
          <input
            id="email"
            type="email"
            placeholder="gueddes@poly.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de Passe :</label>
          <input
            id="password"
            type="password"
            placeholder="123456"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Verification...' : 'Se Connecter (Obtenir Token JWT)'}
        </button>

        <button type="button" className="btn-demo" onClick={fillDemoAccount}>
          Remplir Compte Demo (gueddes@poly.tn / 123456)
        </button>
      </form>
    </section>
  );
}
