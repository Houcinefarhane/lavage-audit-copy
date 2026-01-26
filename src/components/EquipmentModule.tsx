import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Equipment, EquipmentAlert } from '../types';
import { getSites } from '../utils/siteStorage';
import type { Site } from '../utils/sites';

export const EquipmentModule = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<EquipmentAlert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Equipment, 'id' | 'createdAt'>>({
    siteId: '',
    name: '',
    type: 'machine',
    status: 'operational',
    lastMaintenance: '',
    nextMaintenance: '',
    serialNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadSites();
    loadEquipments();
    loadAlerts();
  }, [selectedSiteId]);

  const loadSites = async () => {
    try {
      const loadedSites = await getSites();
      setSites(loadedSites);
      if (loadedSites.length > 0 && !formData.siteId) {
        setFormData(prev => ({ ...prev, siteId: loadedSites[0].id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const loadEquipments = async () => {
    try {
      const stored = localStorage.getItem('equipments');
      if (stored) {
        let data = JSON.parse(stored) as Equipment[];
        if (selectedSiteId !== 'all') {
          data = data.filter(e => e.siteId === selectedSiteId);
        }
        setEquipments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const stored = localStorage.getItem('equipment_alerts');
      if (stored) {
        let data = JSON.parse(stored) as EquipmentAlert[];
        if (selectedSiteId !== 'all') {
          data = data.filter(a => a.siteId === selectedSiteId);
        }
        // Trier par sévérité et date
        data.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity];
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setAlerts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  };

  const saveEquipment = async (equipment: Equipment) => {
    try {
      const stored = localStorage.getItem('equipments');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(equipment);
      localStorage.setItem('equipments', JSON.stringify(existing));
      await loadEquipments();
      // Vérifier si des alertes doivent être créées
      checkMaintenanceAlerts(equipment);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const checkMaintenanceAlerts = (equipment: Equipment) => {
    if (equipment.nextMaintenance) {
      const nextMaintenanceDate = new Date(equipment.nextMaintenance);
      const today = new Date();
      const daysUntil = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 0) {
        createAlert({
          equipmentId: equipment.id,
          siteId: equipment.siteId,
          severity: 'critical',
          message: `Maintenance en retard pour ${equipment.name}`,
          type: 'maintenance_due',
        });
      } else if (daysUntil <= 7) {
        createAlert({
          equipmentId: equipment.id,
          siteId: equipment.siteId,
          severity: 'high',
          message: `Maintenance prévue dans ${daysUntil} jour(s) pour ${equipment.name}`,
          type: 'maintenance_due',
        });
      } else if (daysUntil <= 30) {
        createAlert({
          equipmentId: equipment.id,
          siteId: equipment.siteId,
          severity: 'medium',
          message: `Maintenance prévue dans ${daysUntil} jour(s) pour ${equipment.name}`,
          type: 'maintenance_due',
        });
      }
    }

    if (equipment.status === 'broken') {
      createAlert({
        equipmentId: equipment.id,
        siteId: equipment.siteId,
        severity: 'critical',
        message: `${equipment.name} est en panne`,
        type: 'breakdown',
      });
    } else if (equipment.status === 'maintenance') {
      createAlert({
        equipmentId: equipment.id,
        siteId: equipment.siteId,
        severity: 'medium',
        message: `${equipment.name} est en maintenance`,
        type: 'maintenance_due',
      });
    }
  };

  const createAlert = async (alertData: Omit<EquipmentAlert, 'id' | 'createdAt' | 'resolved' | 'resolvedAt'>) => {
    try {
      const stored = localStorage.getItem('equipment_alerts');
      const existing = stored ? JSON.parse(stored) : [];
      
      // Vérifier si une alerte similaire non résolue existe déjà
      const existingAlert = existing.find(
        (a: EquipmentAlert) =>
          a.equipmentId === alertData.equipmentId &&
          a.type === alertData.type &&
          !a.resolved
      );

      if (!existingAlert) {
        const newAlert: EquipmentAlert = {
          id: `alert-${Date.now()}`,
          ...alertData,
          resolved: false,
          createdAt: new Date().toISOString(),
        };
        existing.push(newAlert);
        localStorage.setItem('equipment_alerts', JSON.stringify(existing));
        await loadAlerts();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
    }
  };

  const handleAddEquipment = async () => {
    if (!formData.siteId || !formData.name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };

    await saveEquipment(newEquipment);
    setFormData({
      siteId: sites.length > 0 ? sites[0].id : '',
      name: '',
      type: 'machine',
      status: 'operational',
      lastMaintenance: '',
      nextMaintenance: '',
      serialNumber: '',
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const stored = localStorage.getItem('equipment_alerts');
      if (stored) {
        const alerts = JSON.parse(stored) as EquipmentAlert[];
        const updated = alerts.map(a =>
          a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a
        );
        localStorage.setItem('equipment_alerts', JSON.stringify(updated));
        await loadAlerts();
      }
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'alerte:', error);
    }
  };

  const statusStats = useMemo(() => {
    const filtered = selectedSiteId !== 'all'
      ? equipments.filter(e => e.siteId === selectedSiteId)
      : equipments;

    return {
      operational: filtered.filter(e => e.status === 'operational').length,
      maintenance: filtered.filter(e => e.status === 'maintenance').length,
      broken: filtered.filter(e => e.status === 'broken').length,
      warning: filtered.filter(e => e.status === 'warning').length,
      total: filtered.length,
    };
  }, [equipments, selectedSiteId]);

  const activeAlerts = useMemo(() => {
    return alerts.filter(a => !a.resolved);
  }, [alerts]);

  const getSeverityColor = (severity: EquipmentAlert['severity']) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'operational': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'broken': return '#ef4444';
      case 'warning': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="equipment-module">
      <div className="module-header">
        <h2>Gestion des Équipements</h2>
        <div className="header-controls">
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="site-filter-select"
          >
            <option value="all">Tous les sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
          <button
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Ajouter un équipement
          </button>
        </div>
      </div>

      {/* Alertes actives */}
      {activeAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>Alertes actives ({activeAlerts.length})</h3>
          <div className="alerts-grid">
            {activeAlerts.slice(0, 6).map(alert => (
              <motion.div
                key={alert.id}
                className="alert-card"
                style={{ borderLeft: `4px solid ${getSeverityColor(alert.severity)}` }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="alert-header">
                  <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <button
                    className="btn-resolve"
                    onClick={() => handleResolveAlert(alert.id)}
                    title="Marquer comme résolu"
                  >
                    ✓
                  </button>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  <span>{sites.find(s => s.id === alert.siteId)?.name || 'N/A'}</span>
                  <span>{new Date(alert.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Équipements</div>
          <div className="kpi-value">{statusStats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Opérationnels</div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{statusStats.operational}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">En Maintenance</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{statusStats.maintenance}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">En Panne</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{statusStats.broken}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Alertes Actives</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{activeAlerts.length}</div>
        </div>
      </div>

      {showAddForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Nouvel équipement</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Site *</label>
              <select
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              >
                <option value="">Sélectionner un site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Terminal de paiement 1"
              />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="terminal">Terminal</option>
                <option value="machine">Machine de lavage</option>
                <option value="pompe">Pompe</option>
                <option value="aspirateur">Aspirateur</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Statut *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment['status'] })}
              >
                <option value="operational">Opérationnel</option>
                <option value="maintenance">En maintenance</option>
                <option value="broken">En panne</option>
                <option value="warning">Avertissement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dernière maintenance</label>
              <input
                type="date"
                value={formData.lastMaintenance}
                onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Prochaine maintenance</label>
              <input
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Numéro de série</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAddEquipment}>
              Enregistrer
            </button>
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* Liste des équipements */}
      <div className="equipments-list">
        <h3>Équipements ({equipments.length})</h3>
        {equipments.length === 0 ? (
          <p className="empty-state">Aucun équipement enregistré</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Site</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Dernière maintenance</th>
                  <th>Prochaine maintenance</th>
                  <th>Numéro de série</th>
                </tr>
              </thead>
              <tbody>
                {equipments.map(eq => (
                  <tr key={eq.id}>
                    <td><strong>{eq.name}</strong></td>
                    <td>{sites.find(s => s.id === eq.siteId)?.name || 'N/A'}</td>
                    <td>{eq.type}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(eq.status),
                          color: 'white',
                        }}
                      >
                        {eq.status}
                      </span>
                    </td>
                    <td>{eq.lastMaintenance ? new Date(eq.lastMaintenance).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>{eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>{eq.serialNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
