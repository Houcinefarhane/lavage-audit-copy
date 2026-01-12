import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Checkpoint, CheckpointStatus, CHECKPOINTS, Audit } from '../types';
import { saveAudit } from '../utils/storage';
import { CheckpointItem } from './CheckpointItem';
import { getSites } from '../utils/siteStorage';
import type { Site } from '../utils/sites';

interface AuditFormProps {
  onSave: () => void;
}

export const AuditForm = ({ onSave }: AuditFormProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [auditId] = useState<string>(() => Date.now().toString());
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(
    CHECKPOINTS.map(cp => ({ ...cp, status: null, photos: [] }))
  );
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const loadedSites = await getSites();
        setSites(loadedSites);
        if (loadedSites.length > 0 && !selectedSiteId) {
          setSelectedSiteId(loadedSites[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sites:', error);
      }
    };
    loadSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (id: string, status: CheckpointStatus) => {
    setCheckpoints(prev =>
      prev.map(cp => (cp.id === id ? { ...cp, status } : cp))
    );
  };

  const handleLabelChange = (id: string, label: string) => {
    setCheckpoints(prev =>
      prev.map(cp => (cp.id === id ? { ...cp, label } : cp))
    );
  };

  const handleDeleteCheckpoint = (id: string) => {
    if (checkpoints.length <= 1) {
      alert('Vous devez garder au moins un point de contrôle.');
      return;
    }
    setCheckpoints(prev => prev.filter(cp => cp.id !== id));
  };

  const handleAddCheckpoint = () => {
    const newId = `checkpoint-${Date.now()}`;
    const newCheckpoint: Checkpoint = {
      id: newId,
      label: 'Nouveau point de contrôle',
      status: null,
      photos: [],
    };
    setCheckpoints(prev => [...prev, newCheckpoint]);
  };

  const handlePhotosChange = (checkpointId: string, photos: string[]) => {
    setCheckpoints(prev =>
      prev.map(cp => (cp.id === checkpointId ? { ...cp, photos } : cp))
    );
  };

  const calculateScore = (): number => {
    const ouiCount = checkpoints.filter(cp => cp.status === 'OUI').length;
    return Math.round((ouiCount / checkpoints.length) * 100);
  };

  const handleSave = async () => {
    if (!selectedSiteId) {
      alert('Veuillez sélectionner un site.');
      return;
    }

    if (uploadingPhotos) {
      alert('Veuillez attendre la fin de l\'upload des photos.');
      return;
    }

    const audit: Audit = {
      id: auditId,
      date: new Date().toISOString(),
      siteId: selectedSiteId,
      comment: comment.trim() || undefined,
      checkpoints: checkpoints.map(cp => ({ ...cp })),
      score: calculateScore(),
      totalCheckpoints: checkpoints.length,
    };

    try {
      await saveAudit(audit);
      onSave();
      
      // Reset form
      setCheckpoints(CHECKPOINTS.map(cp => ({ ...cp, status: null, photos: [] })));
      setComment('');
      if (sites.length > 0) {
        setSelectedSiteId(sites[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'audit. Veuillez réessayer.');
    }
  };

  const ouiCount = checkpoints.filter(cp => cp.status === 'OUI').length;
  const nonCount = checkpoints.filter(cp => cp.status === 'NON').length;
  const pendingCount = checkpoints.filter(cp => cp.status === null).length;
  const canSave = pendingCount === 0;

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  return (
    <div className="audit-form">
      <h2>Nouvel Audit Qualité</h2>
      
      <div className="site-selection">
        <label htmlFor="site-select" className="site-select-label">
          Site à auditer:
        </label>
        <select
          id="site-select"
          className="site-select"
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
        >
          {sites.map(site => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.city})
            </option>
          ))}
        </select>
        {selectedSite && (
          <div className="site-info">
            <span className="site-city">{selectedSite.city}</span>
          </div>
        )}
      </div>

      <div className="comment-field">
        <label htmlFor="audit-comment" className="comment-label">Commentaire (optionnel)</label>
        <textarea
          id="audit-comment"
          className="comment-textarea"
          placeholder="Observations, anomalies, actions à prévoir..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="audit-summary">
        <div className="summary-item">
          <span className="summary-label">OUI:</span>
          <span className="summary-value yes">{ouiCount}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">NON:</span>
          <span className="summary-value no">{nonCount}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">En attente:</span>
          <span className="summary-value pending">{pendingCount}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Score:</span>
          <span className="summary-value score">{calculateScore()}%</span>
        </div>
      </div>

      <div className="checkpoints-list">
        {checkpoints.map((checkpoint, index) => (
          <motion.div
            key={checkpoint.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <CheckpointItem
              checkpoint={checkpoint}
              onStatusChange={handleStatusChange}
              onLabelChange={handleLabelChange}
              onDelete={handleDeleteCheckpoint}
              canDelete={checkpoints.length > 1}
              auditId={auditId}
              onPhotosChange={handlePhotosChange}
              onUploadStateChange={setUploadingPhotos}
            />
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="btn-add-checkpoint"
            onClick={handleAddCheckpoint}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter un point de contrôle
          </button>
        </motion.div>
      </div>

      <div className="form-actions">
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={!canSave || uploadingPhotos}
        >
          {uploadingPhotos ? 'Upload en cours...' : 'Enregistrer l\'audit'}
        </button>
        {!canSave && (
          <p className="warning-text">
            Veuillez répondre à tous les points de contrôle avant d'enregistrer
          </p>
        )}
      </div>
    </div>
  );
};

