import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Site } from '../utils/sites';
import { getSites, addSite, updateSite, deleteSite } from '../utils/siteStorage';

export const SiteManagement = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Site, 'id'>>({
    name: '',
    city: '',
  });

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const loadedSites = await getSites();
      setSites(loadedSites);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.city) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await addSite(formData);
      setFormData({ name: '', city: '' });
      setShowAddForm(false);
      loadSites();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du site:', error);
      alert('Erreur lors de l\'ajout du site. Veuillez réessayer.');
    }
  };

  const handleEdit = (site: Site) => {
    setEditingId(site.id);
    setFormData({
      name: site.name,
      city: site.city,
    });
    setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.name || !formData.city) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await updateSite(editingId, formData);
      setEditingId(null);
      setFormData({ name: '', city: '' });
      loadSites();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du site:', error);
      alert('Erreur lors de la mise à jour du site. Veuillez réessayer.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      try {
        await deleteSite(id);
        loadSites();
      } catch (error: any) {
        if (error.message && error.message.includes('audits')) {
          alert(error.message);
        } else {
          console.error('Erreur lors de la suppression du site:', error);
          alert('Erreur lors de la suppression du site. Veuillez réessayer.');
        }
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', city: '' });
  };

  return (
    <div className="site-management">
      <div className="site-management-header">
        <h2>Gestion des Sites ({sites.length})</h2>
        <button
          className="btn-add-site"
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({ name: '', city: '' });
          }}
        >
          + Ajouter un site
        </button>
      </div>

      <AnimatePresence>
        {(showAddForm || editingId) && (
          <motion.div
            className="site-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
          <h3>{editingId ? 'Modifier le site' : 'Nouveau site'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="site-name">Nom du site *</label>
              <input
                id="site-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Centre Lavage Paris Centre"
              />
            </div>
            <div className="form-group">
              <label htmlFor="site-city">Ville *</label>
              <input
                id="site-city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: Paris"
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              className="btn-save"
              onClick={editingId ? handleUpdate : handleAdd}
            >
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Annuler
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sites-list">
        {sites.length === 0 ? (
          <p className="empty-state">Aucun site enregistré. Ajoutez votre premier site !</p>
        ) : (
          <div className="sites-table">
            <div className="table-header">
              <div className="table-cell">Nom</div>
              <div className="table-cell">Ville</div>
              <div className="table-cell actions">Actions</div>
            </div>
            {sites.map((site, index) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <div className="table-row">
                <div className="table-cell name">{site.name}</div>
                <div className="table-cell">{site.city}</div>
                <div className="table-cell actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(site)}
                    title="Modifier"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(site.id)}
                    title="Supprimer"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

