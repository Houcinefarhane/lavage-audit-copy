import { motion } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-main">Audit Lavage</span>
          <span className="logo-sub">Plateforme Franchisés</span>
        </div>
        <button className="landing-login-btn" onClick={onGetStarted}>
          Se connecter
        </button>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <motion.div
            className="landing-hero-text"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>
              Pilotez la qualité de vos centres de lavage
              <span> avec une vue 360° multi-sites</span>
            </h1>
            <p>
              Une seule plateforme pour suivre vos audits qualité, votre chiffre d&apos;affaires,
              vos équipements et vos équipes sur l&apos;ensemble de votre réseau.
            </p>
            <div className="landing-actions">
              <button className="btn-primary" onClick={onGetStarted}>
                Accéder à l&apos;espace franchisé
              </button>
              <div className="landing-hint">
                Accès réservé aux franchisés et responsables de centre TotalEnergies
              </div>
            </div>
          </motion.div>

          <motion.div
            className="landing-hero-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="panel-header">
              <span>Vue réseau</span>
              <span className="panel-status">Temps réel</span>
            </div>
            <div className="panel-body">
              <div className="panel-kpi">
                <div className="kpi-label">Score qualité moyen</div>
                <div className="kpi-value">92%</div>
                <div className="kpi-trend positive">+4 pts ce mois</div>
              </div>
              <div className="panel-kpi">
                <div className="kpi-label">Sites audités</div>
                <div className="kpi-value">48</div>
                <div className="kpi-trend">sur 52</div>
              </div>
              <div className="panel-kpi">
                <div className="kpi-label">Alertes équipements</div>
                <div className="kpi-value warning">3</div>
                <div className="kpi-trend">à traiter</div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

