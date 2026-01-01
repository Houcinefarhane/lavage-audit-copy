import { useState, useMemo, useEffect } from 'react';
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
// Données dummy supprimées pour utiliser uniquement les vraies données
import { getAudits } from '../utils/storage';
import { getSites, getSiteName } from '../utils/siteStorage';
import type { Site } from '../utils/sites';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export const Dashboard = () => {
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [sites, setSites] = useState<Site[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedSites = await getSites();
        setSites(loadedSites);
        const loadedAudits = await getAudits(selectedSiteFilter !== 'all' ? selectedSiteFilter : undefined);
        setAudits(loadedAudits);
        if (selectedSiteFilter !== 'all') {
          const siteName = await getSiteName(selectedSiteFilter);
          setSelectedSiteName(siteName);
        } else {
          setSelectedSiteName('');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    loadData();
  }, [selectedSiteFilter]);

  const stats = useMemo(() => {
    // Utiliser uniquement les audits réels (données dummy supprimées)
    let allAudits = [...audits];
    
    // Filtrer par site si un site est sélectionné
    if (selectedSiteFilter !== 'all') {
      allAudits = allAudits.filter(audit => audit.siteId === selectedSiteFilter);
    }
    const totalAudits = allAudits.length;
    const avgScore = totalAudits > 0 ? Math.round(
      allAudits.reduce((sum, a) => sum + a.score, 0) / totalAudits
    ) : 0;
    const todayAudits = allAudits.filter(
      (a) => new Date(a.date).toDateString() === new Date().toDateString()
    ).length;
    const excellentAudits = allAudits.filter((a) => a.score >= 80).length;
    const goodAudits = allAudits.filter((a) => a.score >= 60 && a.score < 80).length;
    const poorAudits = allAudits.filter((a) => a.score < 60).length;

    // Données pour le graphique d'évolution (30 derniers jours - 1 mois)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Filtrer les audits du dernier mois
    const lastMonthAudits = allAudits.filter(audit => {
      const auditDate = new Date(audit.date);
      return auditDate >= thirtyDaysAgo;
    });

    // Grouper par jour et calculer la moyenne
    const dailyData: Record<string, { date: string; scores: number[]; oui: number; non: number }> = {};
    
    // Initialiser tous les jours du mois
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        scores: [],
        oui: 0,
        non: 0,
      };
    }

    // Remplir avec les données réelles
    lastMonthAudits.forEach((audit) => {
      const dateKey = new Date(audit.date).toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].scores.push(audit.score);
        dailyData[dateKey].oui += audit.checkpoints.filter((cp: any) => cp.status === 'OUI').length;
        dailyData[dateKey].non += audit.checkpoints.filter((cp: any) => cp.status === 'NON').length;
      }
    });

    // Convertir en tableau avec score moyen par jour
    const lastMonth = Object.values(dailyData).map((day) => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }),
      score: day.scores.length > 0 
        ? Math.round(day.scores.reduce((sum, s) => sum + s, 0) / day.scores.length)
        : 0,
      oui: day.oui,
      non: day.non,
    }));

    // Répartition par score
    const scoreDistribution = [
      { name: 'Excellent (≥80%)', value: excellentAudits, color: COLORS[0] },
      { name: 'Bon (60-79%)', value: goodAudits, color: COLORS[2] },
      { name: 'À améliorer (<60%)', value: poorAudits, color: COLORS[1] },
    ];

    // Top 5 points de contrôle les plus problématiques
    const checkpointIssues: Record<string, number> = {};
    allAudits.forEach((audit) => {
      audit.checkpoints.forEach((cp: any) => {
        if (cp.status === 'NON') {
          checkpointIssues[cp.label] = (checkpointIssues[cp.label] || 0) + 1;
        }
      });
    });

    const topIssues = Object.entries(checkpointIssues)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAudits,
      avgScore,
      todayAudits,
      excellentAudits,
      goodAudits,
      poorAudits,
      lastMonth,
      scoreDistribution,
      topIssues,
    };
  }, [selectedSiteFilter, audits]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tableau de Bord - Statistiques Qualité</h2>
        <div className="site-filter">
          <label htmlFor="dashboard-site-filter">Filtrer par site:</label>
          <select
            id="dashboard-site-filter"
            className="site-filter-select"
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
          >
            <option value="all">Tous les sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedSiteFilter !== 'all' && (
        <div className="selected-site-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Site sélectionné: <strong>{selectedSiteName}</strong>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 6-6" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Audits</div>
            <div className="kpi-value">{stats.totalAudits}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Score Moyen</div>
            <div className="kpi-value">{stats.avgScore}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Audits Aujourd'hui</div>
            <div className="kpi-value">{stats.todayAudits}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Audits Excellents</div>
            <div className="kpi-value">{stats.excellentAudits}</div>
            <div className="kpi-subtext">
              {Math.round((stats.excellentAudits / stats.totalAudits) * 100)}% du total
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        {/* Évolution sur 7 jours */}
        <div className="chart-card">
          <h3>Évolution du Score (30 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.lastMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={2}
                name="Score (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition OUI/NON */}
        <div className="chart-card">
          <h3>Répartition OUI/NON (30 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.lastMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="oui" fill="#10b981" name="OUI" />
              <Bar dataKey="non" fill="#ef4444" name="NON" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par score */}
        <div className="chart-card">
          <h3>Répartition des Audits par Score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.scoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 problèmes */}
        <div className="chart-card">
          <h3>Top 5 Points de Contrôle les Plus Problématiques</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stats.topIssues}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" name="Nombre de NON" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

