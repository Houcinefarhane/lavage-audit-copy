import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditForm } from './components/AuditForm';
import { AuditList } from './components/AuditList';
import { Dashboard } from './components/Dashboard';
import { SiteManagement } from './components/SiteManagement';
import { SiteComparison } from './components/SiteComparison';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'dashboard' | 'sites' | 'comparison'>('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 
          (import.meta.env.PROD ? '/api' : 'http://localhost:3015/api');
        
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userEmail');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
  };

  const handleAuditSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isCheckingAuth) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  // Étape 1 : Landing publique tant que l'utilisateur n'a pas cliqué sur "Se connecter"
  if (!isAuthenticated && showLanding) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLanding(false);
        }}
      />
    );
  }

  // Étape 2 : écran de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>Plateforme Gestion Multi-Sites - Franchisés Lavage</h1>
          <button
            className="btn-logout"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Tableau de Bord
          </button>
          <button
            className={`nav-button ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Comparaison
          </button>
          <button
            className={`nav-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Nouvel Audit
          </button>
          <button
            className={`nav-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Historique
          </button>
          <button
            className={`nav-button ${activeTab === 'sites' ? 'active' : ''}`}
            onClick={() => setActiveTab('sites')}
          >
            Sites
          </button>
        </nav>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AuditForm onSave={handleAuditSaved} />
            </motion.div>
          )}
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AuditList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
            </motion.div>
          )}
          {activeTab === 'sites' && (
            <motion.div
              key="sites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SiteManagement />
            </motion.div>
          )}
          {activeTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SiteComparison />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

