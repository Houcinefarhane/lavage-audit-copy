import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 
        (import.meta.env.PROD ? '/api' : 'http://localhost:3015/api');
      
      const loginUrl = `${API_BASE_URL}/auth/login`;
      console.log('🔗 Tentative de connexion à:', loginUrl);
      console.log('📧 Email:', email);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${text || 'Réponse invalide'}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Stocker le token dans localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);
      
      onLogin();
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      let errorMessage = err.message || 'Erreur de connexion';
      
      // Messages d'erreur plus clairs
      if (err.message?.includes('Failed to fetch') || err.message?.includes('Load failed')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 3015.';
      } else if (err.message?.includes('401') || err.message?.includes('non autorisé')) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Erreur serveur. Vérifiez que le mot de passe est configuré dans server/.env';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="login-header">
          <h1>Audit Qualité</h1>
          <p>Centre de Lavage</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mohamed.farhane@wash.totalenergies.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

