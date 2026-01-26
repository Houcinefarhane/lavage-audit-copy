-- Migration SQL pour transformer l'application en plateforme de gestion multi-sites pour franchisés
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- 1. Étendre la table sites avec des champs supplémentaires
ALTER TABLE sites ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS franchise_name TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS manager_email TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS manager_phone TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS opening_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance'));

-- 2. Table des transactions financières
CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_site_id ON financial_transactions(site_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(date DESC);

-- 3. Table des équipements
CREATE TABLE IF NOT EXISTS equipments (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'broken', 'warning')),
  last_maintenance TIMESTAMP WITH TIME ZONE,
  next_maintenance TIMESTAMP WITH TIME ZONE,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipments_site_id ON equipments(site_id);
CREATE INDEX IF NOT EXISTS idx_equipments_status ON equipments(status);

-- 4. Table des alertes équipements
CREATE TABLE IF NOT EXISTS equipment_alerts (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('maintenance_due', 'breakdown', 'warning', 'other')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_equipment_alerts_site_id ON equipment_alerts(site_id);
CREATE INDEX IF NOT EXISTS idx_equipment_alerts_resolved ON equipment_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_equipment_alerts_severity ON equipment_alerts(severity);

-- 5. Table des terminaux de paiement
CREATE TABLE IF NOT EXISTS terminals (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terminals_site_id ON terminals(site_id);
CREATE INDEX IF NOT EXISTS idx_terminals_status ON terminals(status);

-- 6. Table des transactions de paiement
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  terminal_id TEXT NOT NULL REFERENCES terminals(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash', 'mobile', 'other')),
  service_type TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_site_id ON payment_transactions(site_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_terminal_id ON payment_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(date DESC);

-- 7. Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL CHECK (position IN ('manager', 'operator', 'technician', 'other')),
  hire_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  salary DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_site_id ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- 8. Table des shifts (horaires de travail)
CREATE TABLE IF NOT EXISTS employee_shifts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  hours DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee_id ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_site_id ON employee_shifts(site_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_date ON employee_shifts(date DESC);

-- Activer Row Level Security (RLS) pour les nouvelles tables
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : permettre toutes les opérations (à adapter selon vos besoins de sécurité)
CREATE POLICY "Allow all operations on financial_transactions" ON financial_transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on equipments" ON equipments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on equipment_alerts" ON equipment_alerts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on terminals" ON terminals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on payment_transactions" ON payment_transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on employees" ON employees
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on employee_shifts" ON employee_shifts
  FOR ALL USING (true) WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE financial_transactions IS 'Transactions financières (revenus et dépenses) par site';
COMMENT ON TABLE equipments IS 'Équipements des centres de lavage avec suivi de maintenance';
COMMENT ON TABLE equipment_alerts IS 'Alertes pour les équipements (maintenance, pannes, etc.)';
COMMENT ON TABLE terminals IS 'Terminaux de paiement connectés';
COMMENT ON TABLE payment_transactions IS 'Transactions de paiement depuis les terminaux';
COMMENT ON TABLE employees IS 'Employés des différents sites';
COMMENT ON TABLE employee_shifts IS 'Horaires de travail des employés';
