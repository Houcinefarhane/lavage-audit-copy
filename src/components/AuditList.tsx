import { Audit } from '../types';
import { getAudits, deleteAudit } from '../utils/storage';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSites } from '../utils/siteStorage';
import { generateAuditPDF } from '../utils/pdfGenerator';
import { sendAuditEmail } from '../utils/emailService';

interface AuditListProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export const AuditList = ({ refreshTrigger, onRefresh }: AuditListProps) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string[]>([]);
  const [siteNames, setSiteNames] = useState<Record<string, string>>({});
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailInputVisible, setEmailInputVisible] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState<string>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const loadedSites = await getSites();
        setSites(loadedSites);
        // Créer un map des noms de sites
        const namesMap: Record<string, string> = {};
        for (const site of loadedSites) {
          namesMap[site.id] = site.name;
        }
        setSiteNames(namesMap);
      } catch (error) {
        console.error('Erreur lors du chargement des sites:', error);
      }
    };
    loadSites();
  }, [refreshTrigger]);

  // Fermer le dropdown en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFilterDropdown && !target.closest('.site-filter-multi')) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showFilterDropdown]);

  useEffect(() => {
    const loadAudits = async () => {
      try {
        // Si aucun site sélectionné, charger tous les audits
        const loadedAudits = await getAudits();
        let filteredAudits = loadedAudits;
        
        // Filtrer par les sites sélectionnés si au moins un est sélectionné
        if (selectedSiteFilter.length > 0) {
          filteredAudits = loadedAudits.filter(audit => 
            selectedSiteFilter.includes(audit.siteId)
          );
        }
        
        setAudits(filteredAudits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error('Erreur lors du chargement des audits:', error);
      }
    };
    loadAudits();
  }, [refreshTrigger, selectedSiteFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet audit ?')) {
      try {
        await deleteAudit(id);
        onRefresh();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'audit.');
      }
    }
  };

  const handleGeneratePDF = (audit: Audit) => {
    const siteName = siteNames[audit.siteId] || 'Site inconnu';
    generateAuditPDF({ audit, siteName });
  };

  const handleEmailIconClick = (audit: Audit) => {
    if (emailInputVisible === audit.id) {
      // Si déjà ouvert, fermer
      setEmailInputVisible(null);
      setEmailValue('');
    } else {
      // Ouvrir le champ email
      setEmailInputVisible(audit.id);
      setEmailValue('');
    }
  };

  const handleSendEmail = async (audit: Audit) => {
    const email = emailValue.trim();
    if (!email || !email.includes('@')) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }

    setSendingEmail(audit.id);
    try {
      console.log('Envoi email en cours...', { auditId: audit.id, email, siteName: siteNames[audit.siteId] });
      
      // Envoyer les données complètes de l'audit pour éviter "adresse inconnu"
      const result = await sendAuditEmail(audit.id, email, siteNames[audit.siteId] || 'Site inconnu', audit);
      
      console.log('Réponse serveur:', result);
      alert('Email envoyé avec succès ! Vérifiez votre boîte de réception (et les spams).');
      
      // Fermer le champ et réinitialiser
      setEmailInputVisible(null);
      setEmailValue('');
    } catch (error: any) {
      console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
      const errorMessage = error.message || 'Erreur lors de l\'envoi de l\'email.';
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const helpMessage = isLocal 
        ? 'Vérifiez:\n- Que BREVO_API_KEY est configuré dans server/.env\n- Que le serveur backend est démarré\n- La console pour plus de détails'
        : 'Vérifiez:\n- Que BREVO_API_KEY est configuré dans les variables d\'environnement\n- La console pour plus de détails';
      alert(`Erreur: ${errorMessage}\n\n${helpMessage}`);
    } finally {
      setSendingEmail(null);
    }
  };

  const handleCancelEmail = () => {
    setEmailInputVisible(null);
    setEmailValue('');
  };

  const handleSiteFilterToggle = (siteId: string) => {
    setSelectedSiteFilter(prev => {
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      } else {
        return [...prev, siteId];
      }
    });
  };

  const handleSelectAllSites = () => {
    if (selectedSiteFilter.length === sites.length) {
      // Tout désélectionner
      setSelectedSiteFilter([]);
    } else {
      // Tout sélectionner
      setSelectedSiteFilter(sites.map(site => site.id));
    }
  };

  const getFilterLabel = () => {
    if (selectedSiteFilter.length === 0) {
      return 'Tous les sites';
    }
    if (selectedSiteFilter.length === 1) {
      const siteId = selectedSiteFilter[0];
      return siteNames[siteId] || '1 site';
    }
    return `${selectedSiteFilter.length} sites sélectionnés`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-warning';
    return 'score-poor';
  };

  if (audits.length === 0) {
    return (
      <div className="audit-list">
        <h2>Historique des Audits</h2>
        <p className="empty-state">Aucun audit enregistré pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="audit-list">
      <div className="audit-list-header">
        <h2>Historique des Audits ({audits.length})</h2>
        <div className="site-filter-multi">
          <button
            className="site-filter-button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            {getFilterLabel()}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '0.5rem', transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="site-filter-dropdown"
            >
              <div className="site-filter-option">
                <label className="site-filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSiteFilter.length === sites.length && sites.length > 0}
                    onChange={handleSelectAllSites}
                    className="site-filter-checkbox"
                  />
                  <span>Tous les sites</span>
                </label>
              </div>
              <div className="site-filter-divider"></div>
              {sites.map(site => (
                <div key={site.id} className="site-filter-option">
                  <label className="site-filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedSiteFilter.includes(site.id)}
                      onChange={() => handleSiteFilterToggle(site.id)}
                      className="site-filter-checkbox"
                    />
                    <span>{site.name}</span>
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <div className="audits-grid">
        {audits.map((audit, index) => (
          <motion.div
            key={audit.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="audit-card">
            <div className="audit-card-header">
              <div className="audit-header-info">
                <span className="audit-date">{formatDate(audit.date)}</span>
                <span className="audit-site">{siteNames[audit.siteId] || 'Site inconnu'}</span>
              </div>
              <div className="audit-actions">
                <button
                  className="btn-pdf"
                  onClick={() => handleGeneratePDF(audit)}
                  title="Télécharger en PDF"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </button>
                <button
                  className={`btn-email ${emailInputVisible === audit.id ? 'active' : ''}`}
                  onClick={() => handleEmailIconClick(audit)}
                  title="Envoyer par email"
                  disabled={sendingEmail === audit.id}
                >
                  {sendingEmail === audit.id ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  )}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(audit.id)}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            </div>
            {emailInputVisible === audit.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="email-input-container"
              >
                <div className="email-input-wrapper">
                  <input
                    type="email"
                    className="email-input"
                    placeholder="Entrez l'adresse email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendEmail(audit);
                      }
                    }}
                    autoFocus
                  />
                  <div className="email-input-actions">
                    <button
                      className="btn-send-email"
                      onClick={() => handleSendEmail(audit)}
                      disabled={sendingEmail === audit.id || !emailValue.trim()}
                    >
                      {sendingEmail === audit.id ? 'Envoi...' : 'Envoyer'}
                    </button>
                    <button
                      className="btn-cancel-email"
                      onClick={handleCancelEmail}
                      disabled={sendingEmail === audit.id}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            <div className={`audit-score ${getScoreColor(audit.score)}`}>
              {audit.score}%
            </div>
            {audit.comment && (
              <div className="audit-comment">
                <div className="audit-comment-label">Commentaire</div>
                <p className="audit-comment-text">{audit.comment}</p>
              </div>
            )}
            <div className="audit-details">
              <div className="detail-item">
                <span className="detail-label">OUI:</span>
                <span className="detail-value yes">
                  {audit.checkpoints.filter(cp => cp.status === 'OUI').length}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">NON:</span>
                <span className="detail-value no">
                  {audit.checkpoints.filter(cp => cp.status === 'NON').length}
                </span>
              </div>
            </div>
            <details className="audit-checkpoints">
              <summary>Voir les détails</summary>
              <div className="checkpoints-details">
                {audit.checkpoints.map(cp => (
                  <div key={cp.id} className="checkpoint-detail">
                    <span className="checkpoint-detail-label">{cp.label}:</span>
                    <span className={`checkpoint-detail-status ${cp.status?.toLowerCase()}`}>
                      {cp.status || 'Non renseigné'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

