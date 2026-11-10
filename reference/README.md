# Kit de Démarrage (Starter) - MERN Décalé - Séance 6 (Finale)
## Authentification Full-Stack JWT, Protection des Actions & Déploiement Cloud
Enseignant : Dr. Abdelweheb GUEDDES - École Polytechnique de Sousse

Ce dossier contient le code de départ prêt à l'emploi pour la **Séance 6 (Finale)**. Le code de la Séance 5 (chargement des articles avec Axios + Redux) est déjà fonctionnel.

### 🚀 1. Démarrer le Serveur Express Sécurisé par JWT (Terminal 1)
`ash
cd server
npm install
npm start
`
Compte démo pré-enregistré : gueddes@poly.tn / 123456

### 💻 2. Démarrer le Client React (Terminal 2)
`ash
cd client
npm install
npm run dev
`
Ouvrez http://localhost:5173 : vous êtes en **Mode Visiteur (Lecture seule)**.

### 🛠️ 3. Les 3 Petits Fichiers à Compléter (Blocs // TODO)
Suivez le support PDF **S6_Seance_Interactive_Decale.pdf** inclus dans ce dossier :
1. **client/src/redux/authSlice.js** (Étape 2 - Page 2) : Décommenter loginSuccess et logout.
2. **client/src/api/axiosClient.js** (Étape 3 - Page 3) : Décommenter l'Intercepteur Axios (Bearer ).
3. **client/src/components/AuthCard.jsx** (Étape 4 - Page 4) : Décommenter l'appel xiosClient.post('/auth/login', ...) et dispatch(loginSuccess(response.data)).
