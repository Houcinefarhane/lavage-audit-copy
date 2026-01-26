import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PaymentTransaction, Terminal } from '../types';
import { getSites } from '../utils/siteStorage';
import type { Site } from '../utils/sites';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const PaymentModule = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [showTerminalForm, setShowTerminalForm] = useState(false);
  const [showSyncForm, setShowSyncForm] = useState(false);
  const [terminalFormData, setTerminalFormData] = useState<Omit<Terminal, 'id' | 'createdAt'>>({
    siteId: '',
    name: '',
    type: 'terminal_paiement',
    status: 'active',
    lastSync: '',
  });

  useEffect(() => {
    loadSites();
    loadTerminals();
    loadTransactions();
  }, [selectedSiteId]);

  const loadSites = async () => {
    try {
      const loadedSites = await getSites();
      setSites(loadedSites);
      if (loadedSites.length > 0 && !terminalFormData.siteId) {
        setTerminalFormData(prev => ({ ...prev, siteId: loadedSites[0].id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const loadTerminals = async () => {
    try {
      const stored = localStorage.getItem('terminals');
      if (stored) {
        let data = JSON.parse(stored) as Terminal[];
        if (selectedSiteId !== 'all') {
          data = data.filter(t => t.siteId === selectedSiteId);
        }
        setTerminals(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des terminaux:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const stored = localStorage.getItem('payment_transactions');
      if (stored) {
        let data = JSON.parse(stored) as PaymentTransaction[];
        if (selectedSiteId !== 'all') {
          data = data.filter(t => t.siteId === selectedSiteId);
        }
        // Trier par date décroissante
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  const handleAddTerminal = async () => {
    if (!terminalFormData.siteId || !terminalFormData.name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newTerminal: Terminal = {
      id: `term-${Date.now()}`,
      ...terminalFormData,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('terminals');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(newTerminal);
      localStorage.setItem('terminals', JSON.stringify(existing));
      await loadTerminals();
      setTerminalFormData({
        siteId: sites.length > 0 ? sites[0].id : '',
        name: '',
        type: 'terminal_paiement',
        status: 'active',
        lastSync: '',
      });
      setShowTerminalForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleSyncTerminal = async (terminalId: string) => {
    // Simuler une synchronisation avec le terminal
    // Dans un vrai système, cela appellerait une API pour récupérer les transactions
    const mockTransactions: PaymentTransaction[] = [];
    const now = new Date();
    
    // Générer quelques transactions de test pour les 7 derniers jours
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));

      mockTransactions.push({
        id: `pay-${Date.now()}-${i}`,
        siteId: terminals.find(t => t.id === terminalId)?.siteId || '',
        terminalId,
        date: date.toISOString(),
        amount: Math.round((Math.random() * 50 + 5) * 100) / 100, // Entre 5€ et 55€
        paymentMethod: ['card', 'cash', 'mobile'][Math.floor(Math.random() * 3)] as any,
        serviceType: ['Lavage Express', 'Lavage Premium', 'Aspiration', 'Combo'][Math.floor(Math.random() * 4)],
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      });
    }

    try {
      const stored = localStorage.getItem('payment_transactions');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(...mockTransactions);
      localStorage.setItem('payment_transactions', JSON.stringify(existing));
      
      // Mettre à jour la date de dernière synchronisation
      const terminalsStored = localStorage.getItem('terminals');
      if (terminalsStored) {
        const terminalsData = JSON.parse(terminalsStored) as Terminal[];
        const updated = terminalsData.map(t =>
          t.id === terminalId ? { ...t, lastSync: new Date().toISOString() } : t
        );
        localStorage.setItem('terminals', JSON.stringify(updated));
      }

      await loadTerminals();
      await loadTransactions();
      setShowSyncForm(false);
      alert(`Synchronisation réussie : ${mockTransactions.length} transactions importées`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation');
    }
  };

  const stats = useMemo(() => {
    const filtered = selectedSiteId !== 'all'
      ? transactions.filter(t => t.siteId === selectedSiteId)
      : transactions;

    const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);
    const todayAmount = filtered
      .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + t.amount, 0);

    const byMethod = filtered.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const byService = filtered.reduce((acc, t) => {
      acc[t.serviceType] = (acc[t.serviceType] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Données pour graphique temporel (7 derniers jours)
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      last7Days[dateKey] = 0;
    }

    filtered.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (last7Days[dateKey] !== undefined) {
        last7Days[dateKey] += t.amount;
      }
    });

    const chartData = Object.entries(last7Days).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      amount: Math.round(amount * 100) / 100,
    }));

    return {
      totalAmount,
      todayAmount,
      count: filtered.length,
      byMethod,
      byService,
      chartData,
    };
  }, [transactions, selectedSiteId]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="payment-module">
      <div className="module-header">
        <h2>Intégration Paiements - Terminaux</h2>
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
            onClick={() => setShowTerminalForm(true)}
          >
            + Ajouter un terminal
          </button>
          <button
            className="btn-sync"
            onClick={() => setShowSyncForm(true)}
          >
            🔄 Synchroniser
          </button>
        </div>
      </div>

      {showTerminalForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Nouveau terminal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Site *</label>
              <select
                value={terminalFormData.siteId}
                onChange={(e) => setTerminalFormData({ ...terminalFormData, siteId: e.target.value })}
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
                value={terminalFormData.name}
                onChange={(e) => setTerminalFormData({ ...terminalFormData, name: e.target.value })}
                placeholder="Ex: Terminal Principal"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={terminalFormData.type}
                onChange={(e) => setTerminalFormData({ ...terminalFormData, type: e.target.value })}
              >
                <option value="terminal_paiement">Terminal de paiement</option>
                <option value="borne_interactive">Borne interactive</option>
                <option value="application_mobile">Application mobile</option>
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select
                value={terminalFormData.status}
                onChange={(e) => setTerminalFormData({ ...terminalFormData, status: e.target.value as Terminal['status'] })}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAddTerminal}>
              Enregistrer
            </button>
            <button className="btn-cancel" onClick={() => setShowTerminalForm(false)}>
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {showSyncForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Synchroniser un terminal</h3>
          <div className="form-group">
            <label>Sélectionner un terminal</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSyncTerminal(e.target.value);
                }
              }}
            >
              <option value="">Sélectionner...</option>
              {terminals.filter(t => t.status === 'active').map(terminal => (
                <option key={terminal.id} value={terminal.id}>
                  {terminal.name} - {sites.find(s => s.id === terminal.siteId)?.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-cancel" onClick={() => setShowSyncForm(false)}>
            Fermer
          </button>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Transactions</div>
          <div className="kpi-value">{stats.count}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">CA Total</div>
          <div className="kpi-value">{stats.totalAmount.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">CA Aujourd'hui</div>
          <div className="kpi-value">{stats.todayAmount.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Terminaux Actifs</div>
          <div className="kpi-value">{terminals.filter(t => t.status === 'active').length}</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Évolution CA (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="CA (€)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Répartition par Mode de Paiement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.byMethod).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(stats.byMethod).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Répartition par Type de Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.byService).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
              <Legend />
              <Bar dataKey="value" fill="#10b981" name="CA (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste des terminaux */}
      <div className="terminals-list">
        <h3>Terminaux ({terminals.length})</h3>
        {terminals.length === 0 ? (
          <p className="empty-state">Aucun terminal enregistré</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Site</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Dernière sync</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {terminals.map(term => (
                  <tr key={term.id}>
                    <td><strong>{term.name}</strong></td>
                    <td>{sites.find(s => s.id === term.siteId)?.name || 'N/A'}</td>
                    <td>{term.type}</td>
                    <td>
                      <span className={`badge ${term.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {term.status}
                      </span>
                    </td>
                    <td>{term.lastSync ? new Date(term.lastSync).toLocaleString('fr-FR') : 'Jamais'}</td>
                    <td>
                      <button
                        className="btn-sync-small"
                        onClick={() => handleSyncTerminal(term.id)}
                        disabled={term.status !== 'active'}
                      >
                        🔄 Sync
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dernières transactions */}
      <div className="transactions-list">
        <h3>Dernières transactions ({transactions.length})</h3>
        {transactions.length === 0 ? (
          <p className="empty-state">Aucune transaction enregistrée. Synchronisez un terminal pour importer les données.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date/Heure</th>
                  <th>Site</th>
                  <th>Terminal</th>
                  <th>Service</th>
                  <th>Mode de paiement</th>
                  <th>Montant</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 50).map(trans => (
                  <tr key={trans.id}>
                    <td>{new Date(trans.date).toLocaleString('fr-FR')}</td>
                    <td>{sites.find(s => s.id === trans.siteId)?.name || 'N/A'}</td>
                    <td>{terminals.find(t => t.id === trans.terminalId)?.name || 'N/A'}</td>
                    <td>{trans.serviceType}</td>
                    <td>
                      <span className="badge badge-info">
                        {trans.paymentMethod === 'card' ? 'Carte' :
                         trans.paymentMethod === 'cash' ? 'Espèces' :
                         trans.paymentMethod === 'mobile' ? 'Mobile' : 'Autre'}
                      </span>
                    </td>
                    <td><strong>{trans.amount.toLocaleString('fr-FR')} €</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {trans.transactionId || '-'}
                    </td>
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
