import { useState, useEffect, useMemo } from 'react';
import { getSites } from '../utils/siteStorage';
import { getAudits } from '../utils/storage';
import type { Site } from '../utils/sites';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const SiteComparison = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'revenue' | 'audits' | 'equipment'>('score');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const loadedSites = await getSites();
      setSites(loadedSites);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadChartData = async () => {
      const audits = await getAudits();
      const now = new Date();
      const periodStart = new Date();
      
      if (period === 'week') {
        periodStart.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        periodStart.setMonth(now.getMonth() - 1);
      } else if (period === 'quarter') {
        periodStart.setMonth(now.getMonth() - 3);
      } else {
        periodStart.setFullYear(now.getFullYear() - 1);
      }

      const filteredAudits = audits.filter(a => new Date(a.date) >= periodStart);

      // Charger les données financières
      const stored = localStorage.getItem('financial_transactions');
      const transactions = stored ? JSON.parse(stored) : [];
      const filteredTransactions = transactions.filter((t: any) => {
        const transDate = new Date(t.date);
        return transDate >= periodStart && t.type === 'revenue';
      });

      // Charger les équipements
      const storedEquipments = localStorage.getItem('equipments');
      const equipments = storedEquipments ? JSON.parse(storedEquipments) : [];

      const data = sites.map(site => {
        const siteAudits = filteredAudits.filter(a => a.siteId === site.id);
        const avgScore = siteAudits.length > 0
          ? Math.round(siteAudits.reduce((sum, a) => sum + a.score, 0) / siteAudits.length)
          : 0;

        const siteRevenue = filteredTransactions
          .filter((t: any) => t.siteId === site.id)
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const siteEquipments = equipments.filter((e: any) => e.siteId === site.id);
        const operationalRate = siteEquipments.length > 0
          ? Math.round((siteEquipments.filter((e: any) => e.status === 'operational').length / siteEquipments.length) * 100)
          : 0;

        return {
          siteName: site.name,
          siteId: site.id,
          score: avgScore,
          revenue: siteRevenue,
          auditsCount: siteAudits.length,
          equipmentCount: siteEquipments.length,
          operationalRate,
        };
      }).sort((a, b) => {
        if (selectedMetric === 'score') return b.score - a.score;
        if (selectedMetric === 'revenue') return b.revenue - a.revenue;
        if (selectedMetric === 'audits') return b.auditsCount - a.auditsCount;
        return b.operationalRate - a.operationalRate;
      });

      setChartData(data);
    };
    loadChartData();
  }, [sites, selectedMetric, period]);

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'score': return 'Score moyen (%)';
      case 'revenue': return 'Chiffre d\'affaires (€)';
      case 'audits': return 'Nombre d\'audits';
      case 'equipment': return 'Taux opérationnel (%)';
      default: return '';
    }
  };

  const getMetricKey = () => {
    switch (selectedMetric) {
      case 'score': return 'score';
      case 'revenue': return 'revenue';
      case 'audits': return 'auditsCount';
      case 'equipment': return 'operationalRate';
      default: return 'score';
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="site-comparison">
      <div className="module-header">
        <h2>Comparaison Multi-Sites</h2>
        <div className="header-controls">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className="metric-select"
          >
            <option value="score">Score Qualité</option>
            <option value="revenue">Chiffre d'Affaires</option>
            <option value="audits">Nombre d'Audits</option>
            <option value="equipment">Taux Opérationnel</option>
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="period-select"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">3 derniers mois</option>
            <option value="year">12 derniers mois</option>
          </select>
        </div>
      </div>

      {/* Tableau de classement */}
      <div className="comparison-table">
        <h3>Classement des Sites - {getMetricLabel()}</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Site</th>
                <th>{getMetricLabel()}</th>
                <th>Score Qualité</th>
                <th>CA (€)</th>
                <th>Audits</th>
                <th>Taux Op. (%)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((site, index) => (
                <tr key={site.siteId}>
                  <td>
                    <span className={`rank-badge rank-${index + 1}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td><strong>{site.siteName}</strong></td>
                  <td>
                    <strong style={{
                      color: selectedMetric === 'score' && site.score >= 80 ? '#10b981' :
                             selectedMetric === 'score' && site.score >= 60 ? '#f59e0b' :
                             selectedMetric === 'score' ? '#ef4444' : '#3b82f6'
                    }}>
                      {selectedMetric === 'revenue'
                        ? `${site.revenue.toLocaleString('fr-FR')} €`
                        : selectedMetric === 'audits'
                        ? site.auditsCount
                        : `${site[getMetricKey()]}%`}
                    </strong>
                  </td>
                  <td>{site.score}%</td>
                  <td>{site.revenue.toLocaleString('fr-FR')} €</td>
                  <td>{site.auditsCount}</td>
                  <td>{site.operationalRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graphiques comparatifs */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Comparaison {getMetricLabel()}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData.slice(0, 10)}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="siteName"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => {
                  if (selectedMetric === 'revenue') {
                    return `${value.toLocaleString('fr-FR')} €`;
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey={getMetricKey()} name={getMetricLabel()}>
                {chartData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Vue d'ensemble Multi-Métriques</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData.slice(0, 10)}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="siteName"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                name="Score Qualité (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                name="CA (€)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="operationalRate"
                stroke="#f59e0b"
                name="Taux Op. (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Résumé statistique */}
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Meilleur Site</h4>
          <div className="summary-value">
            {chartData.length > 0 ? chartData[0].siteName : 'N/A'}
          </div>
          <div className="summary-label">
            {getMetricLabel()}: {
              selectedMetric === 'revenue'
                ? `${chartData[0]?.revenue.toLocaleString('fr-FR')} €`
                : selectedMetric === 'audits'
                ? chartData[0]?.auditsCount
                : `${chartData[0]?.[getMetricKey()]}%`
            }
          </div>
        </div>
        <div className="summary-card">
          <h4>Moyenne</h4>
          <div className="summary-value">
            {chartData.length > 0
              ? Math.round(
                  chartData.reduce((sum, s) => sum + s[getMetricKey()], 0) / chartData.length
                )
              : 0}
            {selectedMetric === 'revenue' ? ' €' : '%'}
          </div>
          <div className="summary-label">sur {chartData.length} sites</div>
        </div>
        <div className="summary-card">
          <h4>Écart-type</h4>
          <div className="summary-value">
            {chartData.length > 0
              ? (() => {
                  const avg = chartData.reduce((sum, s) => sum + s[getMetricKey()], 0) / chartData.length;
                  const variance = chartData.reduce((sum, s) => sum + Math.pow(s[getMetricKey()] - avg, 2), 0) / chartData.length;
                  return Math.round(Math.sqrt(variance));
                })()
              : 0}
            {selectedMetric === 'revenue' ? ' €' : '%'}
          </div>
          <div className="summary-label">variabilité</div>
        </div>
      </div>
    </div>
  );
};
