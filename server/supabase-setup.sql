-- Script SQL pour créer les tables dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Table des sites
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des audits
CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  siteId TEXT NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  score INTEGER NOT NULL,
  totalCheckpoints INTEGER NOT NULL,
  comment TEXT,
  checkpoints JSONB NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audits_siteId ON audits(siteId);
CREATE INDEX IF NOT EXISTS idx_audits_date ON audits(date DESC);

-- Activer Row Level Security (RLS) - optionnel mais recommandé
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Politique RLS : permettre toutes les opérations (à adapter selon vos besoins)
CREATE POLICY "Allow all operations on sites" ON sites
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on audits" ON audits
  FOR ALL USING (true) WITH CHECK (true);

-- Insérer les 40 sites par défaut (sites 22-61)
INSERT INTO sites (id, name, city) VALUES
  ('site-022', 'Centre Lavage Saint-Étienne Centre', 'Saint-Étienne'),
  ('site-023', 'Centre Lavage Toulon Centre', 'Toulon'),
  ('site-024', 'Centre Lavage Grenoble Centre', 'Grenoble'),
  ('site-025', 'Centre Lavage Dijon Centre', 'Dijon'),
  ('site-026', 'Centre Lavage Angers Centre', 'Angers'),
  ('site-027', 'Centre Lavage Nîmes Centre', 'Nîmes'),
  ('site-028', 'Centre Lavage Villeurbanne Centre', 'Villeurbanne'),
  ('site-029', 'Centre Lavage Saint-Denis Centre', 'Saint-Denis'),
  ('site-030', 'Centre Lavage Le Mans Centre', 'Le Mans'),
  ('site-031', 'Centre Lavage Aix-en-Provence Centre', 'Aix-en-Provence'),
  ('site-032', 'Centre Lavage Clermont-Ferrand Centre', 'Clermont-Ferrand'),
  ('site-033', 'Centre Lavage Brest Centre', 'Brest'),
  ('site-034', 'Centre Lavage Limoges Centre', 'Limoges'),
  ('site-035', 'Centre Lavage Tours Centre', 'Tours'),
  ('site-036', 'Centre Lavage Amiens Centre', 'Amiens'),
  ('site-037', 'Centre Lavage Perpignan Centre', 'Perpignan'),
  ('site-038', 'Centre Lavage Metz Centre', 'Metz'),
  ('site-039', 'Centre Lavage Besançon Centre', 'Besançon'),
  ('site-040', 'Centre Lavage Boulogne-Billancourt Centre', 'Boulogne-Billancourt'),
  ('site-041', 'Centre Lavage Orléans Centre', 'Orléans'),
  ('site-042', 'Centre Lavage Mulhouse Centre', 'Mulhouse'),
  ('site-043', 'Centre Lavage Caen Centre', 'Caen'),
  ('site-044', 'Centre Lavage Nancy Centre', 'Nancy'),
  ('site-045', 'Centre Lavage Saint-Paul Centre', 'Saint-Paul'),
  ('site-046', 'Centre Lavage Rouen Centre', 'Rouen'),
  ('site-047', 'Centre Lavage Argenteuil Centre', 'Argenteuil'),
  ('site-048', 'Centre Lavage Montreuil Centre', 'Montreuil'),
  ('site-049', 'Centre Lavage Avignon Centre', 'Avignon'),
  ('site-050', 'Centre Lavage Nanterre Centre', 'Nanterre'),
  ('site-051', 'Centre Lavage Créteil Centre', 'Créteil'),
  ('site-052', 'Centre Lavage Dunkerque Centre', 'Dunkerque'),
  ('site-053', 'Centre Lavage Poitiers Centre', 'Poitiers'),
  ('site-054', 'Centre Lavage Asnières-sur-Seine Centre', 'Asnières-sur-Seine'),
  ('site-055', 'Centre Lavage Courbevoie Centre', 'Courbevoie'),
  ('site-056', 'Centre Lavage Vitry-sur-Seine Centre', 'Vitry-sur-Seine'),
  ('site-057', 'Centre Lavage Aubervilliers Centre', 'Aubervilliers'),
  ('site-058', 'Centre Lavage La Rochelle Centre', 'La Rochelle'),
  ('site-059', 'Centre Lavage Rueil-Malmaison Centre', 'Rueil-Malmaison'),
  ('site-060', 'Centre Lavage Champigny-sur-Marne Centre', 'Champigny-sur-Marne')
ON CONFLICT (id) DO NOTHING;

