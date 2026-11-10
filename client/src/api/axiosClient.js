import axios from 'axios';

// Instance Axios pointant vers le serveur Express
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Intercepteur JWT pour injecter le token stocké
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour normaliser les messages d'erreur
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
    const normalized = new Error(message);
    // Keep the HTTP status so callers can tell "session expired" (401) from a dropped connection.
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default axiosClient;

