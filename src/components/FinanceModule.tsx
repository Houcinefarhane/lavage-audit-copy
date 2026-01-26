import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FinancialTransaction, FinancialSummary } from '../types';
import { getSites } from '../utils/siteStorage';
import type { Site } from '../utils/sites';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const FinanceModule = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<FinancialTransaction, 'id' | 'createdAt'>>({
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'revenue',
    category: '',
    amount: 0,
    description: '',
  });

  useEffect(() => {
    loadSites();
    loadTransactions();
  }, [selectedSiteId, period]);

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

  const loadTransactions = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      const stored = localStorage.getItem('financial_transactions');
      if (stored) {
        let data = JSON.parse(stored) as FinancialTransaction[];
        if (selectedSiteId !== 'all') {
          data = data.filter(t => t.siteId === selectedSiteId);
        }
        setTransactions(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  const saveTransaction = async (transaction: FinancialTransaction) => {
    try {
      // TODO: Remplacer par un appel API réel
      const stored = localStorage.getItem('financial_transactions');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(transaction);
      localStorage.setItem('financial_transactions', JSON.stringify(existing));
      await loadTransactions();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!formData.siteId || !formData.category || formData.amount <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newTransaction: FinancialTransaction = {
      id: `trans-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };

    await saveTransaction(newTransaction);
    setFormData({
      siteId: sites.length > 0 ? sites[0].id : '',
      date: new Date().toISOString().split('T')[0],
      type: 'revenue',
      category: '',
      amount: 0,
      description: '',
    });
    setShowAddForm(false);
  };

  const summary = useMemo(() => {
    const filtered = selectedSiteId !== 'all'
      ? transactions.filter(t => t.siteId === selectedSiteId)
      : transactions;

    const revenue = filtered
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      count: filtered.length,
    };
  }, [transactions, selectedSiteId]);

  const chartData = useMemo(() => {
    const filtered = selectedSiteId !== 'all'
      ? transactions.filter(t => t.siteId === selectedSiteId)
      : transactions;

    // Grouper par date selon la période
    const grouped: Record<string, { revenue: number; expenses: number; date: string }> = {};
    
    filtered.forEach(t => {
      const date = new Date(t.date);
      let key = '';
      
      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = String(date.getFullYear());
      }

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, expenses: 0, date: key };
      }

      if (t.type === 'revenue') {
        grouped[key].revenue += t.amount;
      } else {
        grouped[key].expenses += t.amount;
      }
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, selectedSiteId, period]);

  const siteComparison = useMemo(() => {
    const siteData: Record<string, { revenue: number; expenses: number; profit: number }> = {};
    
    transactions.forEach(t => {
      if (!siteData[t.siteId]) {
        siteData[t.siteId] = { revenue: 0, expenses: 0, profit: 0 };
      }
      if (t.type === 'revenue') {
        siteData[t.siteId].revenue += t.amount;
      } else {
        siteData[t.siteId].expenses += t.amount;
      }
      siteData[t.siteId].profit = siteData[t.siteId].revenue - siteData[t.siteId].expenses;
    });

    return Object.entries(siteData).map(([siteId, data]) => {
      const site = sites.find(s => s.id === siteId);
      return {
        siteName: site?.name || 'Site inconnu',
        ...data,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [transactions, sites]);

  return (
    <div className="finance-module">
      <div className="module-header">
        <h2>Module Finance & Chiffre d'Affaires</h2>
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
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="period-select"
          >
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </select>
          <button
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Nouvelle transaction
          </button>
        </div>
      </div>

      {showAddForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Nouvelle transaction</h3>
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
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'revenue' | 'expense' })}
              >
                <option value="revenue">Revenu</option>
                <option value="expense">Dépense</option>
              </select>
            </div>
            <div className="form-group">
              <label>Catégorie *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Lavage, Maintenance, Salaires..."
              />
            </div>
            <div className="form-group">
              <label>Montant (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAddTransaction}>
              Enregistrer
            </button>
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Chiffre d'Affaires</div>
          <div className="kpi-value">{summary.revenue.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Dépenses</div>
          <div className="kpi-value">{summary.expenses.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Bénéfice</div>
          <div className="kpi-value" style={{ color: summary.profit >= 0 ? '#10b981' : '#ef4444' }}>
            {summary.profit.toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Transactions</div>
          <div className="kpi-value">{summary.count}</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Évolution Revenus / Dépenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenus" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Dépenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Comparaison par Site</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={siteComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="siteName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenus" />
              <Bar dataKey="expenses" fill="#ef4444" name="Dépenses" />
              <Bar dataKey="profit" fill="#3b82f6" name="Bénéfice" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="transactions-list">
        <h3>Dernières transactions</h3>
        {transactions.length === 0 ? (
          <p className="empty-state">Aucune transaction enregistrée</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Site</th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th>Montant</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map(trans => (
                  <tr key={trans.id}>
                    <td>{new Date(trans.date).toLocaleDateString('fr-FR')}</td>
                    <td>{sites.find(s => s.id === trans.siteId)?.name || 'N/A'}</td>
                    <td>
                      <span className={`badge ${trans.type === 'revenue' ? 'badge-success' : 'badge-danger'}`}>
                        {trans.type === 'revenue' ? 'Revenu' : 'Dépense'}
                      </span>
                    </td>
                    <td>{trans.category}</td>
                    <td style={{ fontWeight: 'bold', color: trans.type === 'revenue' ? '#10b981' : '#ef4444' }}>
                      {trans.type === 'revenue' ? '+' : '-'}{trans.amount.toLocaleString('fr-FR')} €
                    </td>
                    <td>{trans.description || '-'}</td>
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
