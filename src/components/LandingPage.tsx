import { motion } from 'framer-motion';
import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: '📊',
      title: 'Audits Qualité',
      description: 'Suivez et pilotez la qualité de vos centres avec des audits détaillés et des rapports en temps réel.',
    },
    {
      icon: '📈',
      title: 'Comparaison Multi-Sites',
      description: 'Comparez les performances de vos différents sites et identifiez les meilleures pratiques.',
    },
  ];

  const stats = [
    { value: '92%', label: 'Score qualité moyen' },
    { value: '48', label: 'Audits ce mois' },
    { value: '52', label: 'Sites audités' },
    { value: '24/7', label: 'Support disponible' },
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <div className="brand-logo">
              <span className="brand-icon">🚗</span>
              <div className="brand-text">
                <span className="brand-name">Audit Lavage</span>
                <span className="brand-tagline">Plateforme Franchisés</span>
              </div>
            </div>
          </div>
          <nav className="landing-nav-links">
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#stats" className="nav-link">Performance</a>
            <button className="nav-link-btn" onClick={onGetStarted}>
              Se connecter
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="badge-dot"></span>
              Plateforme de gestion multi-sites
            </motion.div>
            <h1 className="hero-title">
              Pilotez votre réseau de centres de lavage
              <span className="hero-title-accent"> avec une vue 360°</span>
            </h1>
            <p className="hero-description">
              Une solution complète pour gérer vos audits qualité et comparer les performances
              de vos différents sites. Tout ce dont vous avez besoin pour optimiser
              la qualité de votre réseau en un seul endroit.
            </p>
            <div className="hero-cta">
              <button className="btn-hero-primary" onClick={onGetStarted}>
                Accéder à la plateforme
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button className="btn-hero-secondary">
                Voir la démo
              </button>
            </div>
            <div className="hero-trust">
              <div className="trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Sécurisé
              </div>
              <div className="trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Certifié
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="visual-card">
              <div className="visual-header">
                <div className="visual-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="visual-title">Tableau de bord</div>
              </div>
              <div className="visual-content">
                <div className="visual-stats">
                  <div className="visual-stat">
                    <div className="stat-label">Score qualité</div>
                    <div className="stat-value">92%</div>
                    <div className="stat-trend up">+4%</div>
                  </div>
                  <div className="visual-stat">
                    <div className="stat-label">Audits ce mois</div>
                    <div className="stat-value">48</div>
                    <div className="stat-trend up">+12%</div>
                  </div>
                  <div className="visual-stat">
                    <div className="stat-label">Sites audités</div>
                    <div className="stat-value">48/52</div>
                    <div className="stat-trend">92%</div>
                  </div>
                </div>
                <div className="visual-chart">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '70%' }}></div>
                  <div className="chart-bar" style={{ height: '85%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="landing-stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="stat-value-large">{stat.value}</div>
              <div className="stat-label-large">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features-section">
        <div className="features-container">
          <motion.div
            className="features-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="features-title">Tout ce dont vous avez besoin</h2>
            <p className="features-subtitle">
              Une plateforme complète pour gérer efficacement votre réseau de centres de lavage
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`feature-card ${hoveredFeature === index ? 'feature-hovered' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="cta-container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="cta-title">Prêt à optimiser votre réseau ?</h2>
            <p className="cta-description">
              Rejoignez les franchisés qui utilisent déjà notre plateforme pour améliorer
              leurs performances et simplifier leur gestion quotidienne.
            </p>
            <button className="btn-cta-primary" onClick={onGetStarted}>
              Commencer maintenant
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <p className="cta-note">
              Accès réservé aux franchisés et responsables de centre TotalEnergies
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-logo">
              <span className="brand-icon">🚗</span>
              <span className="brand-name">Audit Lavage</span>
            </div>
            <p className="footer-tagline">Plateforme de gestion pour franchisés</p>
          </div>
          <div className="footer-links">
            <a href="#features" className="footer-link">Fonctionnalités</a>
            <a href="#stats" className="footer-link">Performance</a>
            <a href="#" className="footer-link">Support</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Audit Lavage. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
