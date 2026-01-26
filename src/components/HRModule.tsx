import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Employee, EmployeeShift } from '../types';
import { getSites } from '../utils/siteStorage';
import type { Site } from '../utils/sites';
import {
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

export const HRModule = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<EmployeeShift[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState<Omit<Employee, 'id' | 'createdAt'>>({
    siteId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: 'operator',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    salary: 0,
    notes: '',
  });
  const [shiftFormData, setShiftFormData] = useState<Omit<EmployeeShift, 'id'>>({
    employeeId: '',
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    hours: 0,
    notes: '',
  });

  useEffect(() => {
    loadSites();
    loadEmployees();
    loadShifts();
  }, [selectedSiteId]);

  const loadSites = async () => {
    try {
      const loadedSites = await getSites();
      setSites(loadedSites);
      if (loadedSites.length > 0 && !employeeFormData.siteId) {
        setEmployeeFormData(prev => ({ ...prev, siteId: loadedSites[0].id }));
        setShiftFormData(prev => ({ ...prev, siteId: loadedSites[0].id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const stored = localStorage.getItem('employees');
      if (stored) {
        let data = JSON.parse(stored) as Employee[];
        if (selectedSiteId !== 'all') {
          data = data.filter(e => e.siteId === selectedSiteId);
        }
        setEmployees(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const loadShifts = async () => {
    try {
      const stored = localStorage.getItem('employee_shifts');
      if (stored) {
        let data = JSON.parse(stored) as EmployeeShift[];
        if (selectedSiteId !== 'all') {
          data = data.filter(s => s.siteId === selectedSiteId);
        }
        setShifts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des shifts:', error);
    }
  };

  const handleAddEmployee = async () => {
    if (!employeeFormData.siteId || !employeeFormData.firstName || !employeeFormData.lastName) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      ...employeeFormData,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('employees');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(newEmployee);
      localStorage.setItem('employees', JSON.stringify(existing));
      await loadEmployees();
      setEmployeeFormData({
        siteId: sites.length > 0 ? sites[0].id : '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: 'operator',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        salary: 0,
        notes: '',
      });
      setShowEmployeeForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleAddShift = async () => {
    if (!shiftFormData.employeeId || !shiftFormData.date || !shiftFormData.startTime) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Calculer les heures si endTime est fourni
    let hours = shiftFormData.hours;
    if (shiftFormData.endTime) {
      const start = new Date(`${shiftFormData.date}T${shiftFormData.startTime}`);
      const end = new Date(`${shiftFormData.date}T${shiftFormData.endTime}`);
      hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }

    const newShift: EmployeeShift = {
      id: `shift-${Date.now()}`,
      ...shiftFormData,
      hours: hours || 0,
    };

    try {
      const stored = localStorage.getItem('employee_shifts');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(newShift);
      localStorage.setItem('employee_shifts', JSON.stringify(existing));
      await loadShifts();
      setShiftFormData({
        employeeId: '',
        siteId: sites.length > 0 ? sites[0].id : '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        hours: 0,
        notes: '',
      });
      setShowShiftForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const stats = useMemo(() => {
    const filteredEmployees = selectedSiteId !== 'all'
      ? employees.filter(e => e.siteId === selectedSiteId)
      : employees;

    const activeEmployees = filteredEmployees.filter(e => e.status === 'active');
    const byPosition = filteredEmployees.reduce((acc, e) => {
      acc[e.position] = (acc[e.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSalary = filteredEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);

    // Calculer les heures travaillées ce mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate >= monthStart && s.hours > 0;
    });
    const totalHours = monthShifts.reduce((sum, s) => sum + s.hours, 0);

    return {
      total: filteredEmployees.length,
      active: activeEmployees.length,
      inactive: filteredEmployees.length - activeEmployees.length,
      byPosition,
      totalSalary,
      totalHours,
    };
  }, [employees, shifts, selectedSiteId]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="hr-module">
      <div className="module-header">
        <h2>Module Ressources Humaines</h2>
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
            onClick={() => setShowEmployeeForm(true)}
          >
            + Nouvel employé
          </button>
          <button
            className="btn-add"
            onClick={() => setShowShiftForm(true)}
          >
            + Nouveau shift
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Employés</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Employés Actifs</div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{stats.active}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Masse Salariale</div>
          <div className="kpi-value">{stats.totalSalary.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Heures ce mois</div>
          <div className="kpi-value">{Math.round(stats.totalHours)}h</div>
        </div>
      </div>

      {showEmployeeForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Nouvel employé</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Site *</label>
              <select
                value={employeeFormData.siteId}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, siteId: e.target.value })}
              >
                <option value="">Sélectionner un site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                value={employeeFormData.firstName}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={employeeFormData.lastName}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={employeeFormData.email}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                value={employeeFormData.phone}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Poste *</label>
              <select
                value={employeeFormData.position}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, position: e.target.value })}
              >
                <option value="manager">Manager</option>
                <option value="operator">Opérateur</option>
                <option value="technician">Technicien</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date d'embauche *</label>
              <input
                type="date"
                value={employeeFormData.hireDate}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, hireDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select
                value={employeeFormData.status}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, status: e.target.value as Employee['status'] })}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="on_leave">En congé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Salaire mensuel (€)</label>
              <input
                type="number"
                step="0.01"
                value={employeeFormData.salary}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, salary: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={employeeFormData.notes}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAddEmployee}>
              Enregistrer
            </button>
            <button className="btn-cancel" onClick={() => setShowEmployeeForm(false)}>
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {showShiftForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Nouveau shift</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Site *</label>
              <select
                value={shiftFormData.siteId}
                onChange={(e) => {
                  setShiftFormData({ ...shiftFormData, siteId: e.target.value, employeeId: '' });
                }}
              >
                <option value="">Sélectionner un site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Employé *</label>
              <select
                value={shiftFormData.employeeId}
                onChange={(e) => setShiftFormData({ ...shiftFormData, employeeId: e.target.value })}
                disabled={!shiftFormData.siteId}
              >
                <option value="">Sélectionner un employé</option>
                {employees
                  .filter(e => e.siteId === shiftFormData.siteId && e.status === 'active')
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={shiftFormData.date}
                onChange={(e) => setShiftFormData({ ...shiftFormData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Heure de début *</label>
              <input
                type="time"
                value={shiftFormData.startTime}
                onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Heure de fin</label>
              <input
                type="time"
                value={shiftFormData.endTime}
                onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Heures (si non calculé)</label>
              <input
                type="number"
                step="0.25"
                value={shiftFormData.hours}
                onChange={(e) => setShiftFormData({ ...shiftFormData, hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={shiftFormData.notes}
                onChange={(e) => setShiftFormData({ ...shiftFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAddShift}>
              Enregistrer
            </button>
            <button className="btn-cancel" onClick={() => setShowShiftForm(false)}>
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Répartition par Poste</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.byPosition).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(stats.byPosition).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Répartition par Site</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sites.map(site => ({
                siteName: site.name,
                count: employees.filter(e => e.siteId === site.id).length,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="siteName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Nombre d'employés" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="employees-list">
        <h3>Employés ({employees.length})</h3>
        {employees.length === 0 ? (
          <p className="empty-state">Aucun employé enregistré</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Site</th>
                  <th>Poste</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date embauche</th>
                  <th>Statut</th>
                  <th>Salaire</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                    <td>{sites.find(s => s.id === emp.siteId)?.name || 'N/A'}</td>
                    <td>{emp.position}</td>
                    <td>{emp.email || '-'}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>{new Date(emp.hireDate).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${
                        emp.status === 'active' ? 'badge-success' :
                        emp.status === 'inactive' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{emp.salary ? `${emp.salary.toLocaleString('fr-FR')} €` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Derniers shifts */}
      <div className="shifts-list">
        <h3>Derniers shifts ({shifts.length})</h3>
        {shifts.length === 0 ? (
          <p className="empty-state">Aucun shift enregistré</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employé</th>
                  <th>Site</th>
                  <th>Heure début</th>
                  <th>Heure fin</th>
                  <th>Heures</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {shifts.slice(0, 30).map(shift => {
                  const employee = employees.find(e => e.id === shift.employeeId);
                  return (
                    <tr key={shift.id}>
                      <td>{new Date(shift.date).toLocaleDateString('fr-FR')}</td>
                      <td><strong>{employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}</strong></td>
                      <td>{sites.find(s => s.id === shift.siteId)?.name || 'N/A'}</td>
                      <td>{shift.startTime}</td>
                      <td>{shift.endTime || '-'}</td>
                      <td>{shift.hours ? `${shift.hours.toFixed(2)}h` : '-'}</td>
                      <td>{shift.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
