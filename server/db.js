// Module de base de données - Support Supabase et SQLite (fallback)
import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Supabase
// On lit d'abord les variables d'environnement, puis on tombe
// sur les valeurs fournies si elles ne sont pas définies.
const supabaseUrl =
  process.env.SUPABASE_URL ||
  'https://onevlbtqovhsgqcsoqva.supabase.co';

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZXZsYnRxb3Zoc2dxY3NvcXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc3NTEsImV4cCI6MjA4MTQ2Mzc1MX0.Dxnm1X33WDxfHm7ROsu-LLt2-icERkvc4LShy2on4E8';
const useSupabase = supabaseUrl && supabaseKey;

let supabase = null;
let sqliteDb = null;

// Initialiser Supabase si configuré
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Connexion à Supabase activée');
} else {
  // Fallback vers SQLite pour le développement local
  sqliteDb = new Database(join(__dirname, 'database.sqlite'));
  console.log('⚠️  Supabase non configuré, utilisation de SQLite (mode développement)');
  
  // Créer les tables SQLite si elles n'existent pas
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      siteId TEXT NOT NULL,
      score INTEGER NOT NULL,
      totalCheckpoints INTEGER NOT NULL,
      comment TEXT,
      checkpoints TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audits_siteId ON audits(siteId);
    CREATE INDEX IF NOT EXISTS idx_audits_date ON audits(date);
  `);
}

// ===== FONCTIONS AUDITS =====

export const getAudits = async (siteId = null) => {
  if (useSupabase) {
    let query = supabase.from('audits').select('*').order('date', { ascending: false });
    
    if (siteId && siteId !== 'all') {
      // Dans la base Postgres, la colonne est siteid (non camelCase)
      query = query.eq('siteid', siteId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur Supabase getAudits:', error);
      throw error;
    }
    
    return data.map(audit => {
      const checkpointsValue =
        typeof audit.checkpoints === 'string'
          ? JSON.parse(audit.checkpoints)
          : audit.checkpoints;

      // Normaliser le nom de la colonne siteId pour le frontend
      const siteIdValue = audit.siteId ?? audit.siteid;
      const totalCheckpointsValue =
        audit.totalCheckpoints ?? audit.totalcheckpoints;

      return {
        ...audit,
        siteId: siteIdValue,
        totalCheckpoints: totalCheckpointsValue,
        checkpoints: checkpointsValue,
      };
    });
  } else {
    // SQLite fallback
    let query = 'SELECT * FROM audits ORDER BY date DESC';
    let params = [];
    
    if (siteId && siteId !== 'all') {
      query = 'SELECT * FROM audits WHERE siteId = ? ORDER BY date DESC';
      params = [siteId];
    }
    
    const audits = sqliteDb.prepare(query).all(...params);
    return audits.map(audit => ({
      ...audit,
      checkpoints: JSON.parse(audit.checkpoints),
    }));
  }
};

export const createAudit = async (audit) => {
  const { id, date, siteId, score, totalCheckpoints, comment, checkpoints } = audit;
  
  if (useSupabase) {
    const { data, error } = await supabase
      .from('audits')
      .insert([{
        id,
        date,
        // Colonnes réelles dans Postgres (tout en minuscules)
        siteid: siteId,
        score,
        totalcheckpoints: totalCheckpoints,
        comment: comment || null,
        // On envoie directement le tableau, Supabase le stocke en JSONB
        checkpoints,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase createAudit:', error);
      throw error;
    }
    
    return data;
  } else {
    // SQLite fallback
    sqliteDb.prepare(
      'INSERT INTO audits (id, date, siteId, score, totalCheckpoints, comment, checkpoints) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, date, siteId, score, totalCheckpoints, comment || null, JSON.stringify(checkpoints));
    
    return { id };
  }
};

export const deleteAudit = async (id) => {
  if (useSupabase) {
    const { error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur Supabase deleteAudit:', error);
      throw error;
    }
    
    return { success: true };
  } else {
    // SQLite fallback
    const result = sqliteDb.prepare('DELETE FROM audits WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      throw new Error('Audit non trouvé');
    }
    
    return { success: true };
  }
};

// ===== FONCTIONS SITES =====

export const getSites = async () => {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erreur Supabase getSites:', error);
      throw error;
    }
    
    return data || [];
  } else {
    // SQLite fallback
    return sqliteDb.prepare('SELECT * FROM sites ORDER BY name').all();
  }
};

export const getSite = async (id) => {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur Supabase getSite:', error);
      throw error;
    }
    
    return data;
  } else {
    // SQLite fallback
    return sqliteDb.prepare('SELECT * FROM sites WHERE id = ?').get(id);
  }
};

export const createSite = async (site) => {
  const { name, city } = site;
  const id = `site-${Date.now()}`;
  
  if (useSupabase) {
    const { data, error } = await supabase
      .from('sites')
      .insert([{ id, name, city }])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase createSite:', error);
      throw error;
    }
    
    return data;
  } else {
    // SQLite fallback
    sqliteDb.prepare('INSERT INTO sites (id, name, city) VALUES (?, ?, ?)').run(id, name, city);
    return { id, name, city };
  }
};

export const updateSite = async (id, site) => {
  const { name, city } = site;
  
  if (useSupabase) {
    const { data, error } = await supabase
      .from('sites')
      .update({ name, city })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase updateSite:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Site non trouvé');
    }
    
    return data;
  } else {
    // SQLite fallback
    const result = sqliteDb.prepare('UPDATE sites SET name = ?, city = ? WHERE id = ?').run(name, city, id);
    
    if (result.changes === 0) {
      throw new Error('Site non trouvé');
    }
    
    return { id, name, city };
  }
};

export const deleteSite = async (id) => {
  if (useSupabase) {
    // Vérifier si le site a des audits
    const { count } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true })
      // Colonne réelle = siteid
      .eq('siteid', id);
    
    if (count > 0) {
      throw new Error('Impossible de supprimer ce site car il contient des audits enregistrés');
    }
    
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur Supabase deleteSite:', error);
      throw error;
    }
    
    return { success: true };
  } else {
    // SQLite fallback
    const auditCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM audits WHERE siteId = ?').get(id);
    if (auditCount.count > 0) {
      throw new Error('Impossible de supprimer ce site car il contient des audits enregistrés');
    }
    
    const result = sqliteDb.prepare('DELETE FROM sites WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      throw new Error('Site non trouvé');
    }
    
    return { success: true };
  }
};

// Initialiser les sites par défaut (uniquement pour SQLite)
export const initializeDefaultSites = async () => {
  if (useSupabase) {
    // Pour Supabase, on laisse l'utilisateur créer les sites via l'interface
    // Les sites sont créés via le script SQL supabase-setup.sql
    return;
  }
  
  // SQLite seulement
  const siteCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM sites').get();
  if (siteCount.count === 0) {
    // 40 sites par défaut (sites 22-61)
    const defaultSites = [
      { id: 'site-022', name: 'Centre Lavage Saint-Étienne Centre', city: 'Saint-Étienne' },
      { id: 'site-023', name: 'Centre Lavage Toulon Centre', city: 'Toulon' },
      { id: 'site-024', name: 'Centre Lavage Grenoble Centre', city: 'Grenoble' },
      { id: 'site-025', name: 'Centre Lavage Dijon Centre', city: 'Dijon' },
      { id: 'site-026', name: 'Centre Lavage Angers Centre', city: 'Angers' },
      { id: 'site-027', name: 'Centre Lavage Nîmes Centre', city: 'Nîmes' },
      { id: 'site-028', name: 'Centre Lavage Villeurbanne Centre', city: 'Villeurbanne' },
      { id: 'site-029', name: 'Centre Lavage Saint-Denis Centre', city: 'Saint-Denis' },
      { id: 'site-030', name: 'Centre Lavage Le Mans Centre', city: 'Le Mans' },
      { id: 'site-031', name: 'Centre Lavage Aix-en-Provence Centre', city: 'Aix-en-Provence' },
      { id: 'site-032', name: 'Centre Lavage Clermont-Ferrand Centre', city: 'Clermont-Ferrand' },
      { id: 'site-033', name: 'Centre Lavage Brest Centre', city: 'Brest' },
      { id: 'site-034', name: 'Centre Lavage Limoges Centre', city: 'Limoges' },
      { id: 'site-035', name: 'Centre Lavage Tours Centre', city: 'Tours' },
      { id: 'site-036', name: 'Centre Lavage Amiens Centre', city: 'Amiens' },
      { id: 'site-037', name: 'Centre Lavage Perpignan Centre', city: 'Perpignan' },
      { id: 'site-038', name: 'Centre Lavage Metz Centre', city: 'Metz' },
      { id: 'site-039', name: 'Centre Lavage Besançon Centre', city: 'Besançon' },
      { id: 'site-040', name: 'Centre Lavage Boulogne-Billancourt Centre', city: 'Boulogne-Billancourt' },
      { id: 'site-041', name: 'Centre Lavage Orléans Centre', city: 'Orléans' },
      { id: 'site-042', name: 'Centre Lavage Mulhouse Centre', city: 'Mulhouse' },
      { id: 'site-043', name: 'Centre Lavage Caen Centre', city: 'Caen' },
      { id: 'site-044', name: 'Centre Lavage Nancy Centre', city: 'Nancy' },
      { id: 'site-045', name: 'Centre Lavage Saint-Paul Centre', city: 'Saint-Paul' },
      { id: 'site-046', name: 'Centre Lavage Rouen Centre', city: 'Rouen' },
      { id: 'site-047', name: 'Centre Lavage Argenteuil Centre', city: 'Argenteuil' },
      { id: 'site-048', name: 'Centre Lavage Montreuil Centre', city: 'Montreuil' },
      { id: 'site-049', name: 'Centre Lavage Avignon Centre', city: 'Avignon' },
      { id: 'site-050', name: 'Centre Lavage Nanterre Centre', city: 'Nanterre' },
      { id: 'site-051', name: 'Centre Lavage Créteil Centre', city: 'Créteil' },
      { id: 'site-052', name: 'Centre Lavage Dunkerque Centre', city: 'Dunkerque' },
      { id: 'site-053', name: 'Centre Lavage Poitiers Centre', city: 'Poitiers' },
      { id: 'site-054', name: 'Centre Lavage Asnières-sur-Seine Centre', city: 'Asnières-sur-Seine' },
      { id: 'site-055', name: 'Centre Lavage Courbevoie Centre', city: 'Courbevoie' },
      { id: 'site-056', name: 'Centre Lavage Vitry-sur-Seine Centre', city: 'Vitry-sur-Seine' },
      { id: 'site-057', name: 'Centre Lavage Aubervilliers Centre', city: 'Aubervilliers' },
      { id: 'site-058', name: 'Centre Lavage La Rochelle Centre', city: 'La Rochelle' },
      { id: 'site-059', name: 'Centre Lavage Rueil-Malmaison Centre', city: 'Rueil-Malmaison' },
      { id: 'site-060', name: 'Centre Lavage Champigny-sur-Marne Centre', city: 'Champigny-sur-Marne' },
    ];
    
    const insertSite = sqliteDb.prepare('INSERT INTO sites (id, name, city) VALUES (?, ?, ?)');
    const insertMany = sqliteDb.transaction((sites) => {
      for (const site of sites) {
        insertSite.run(site.id, site.name, site.city);
      }
    });
    insertMany(defaultSites);
    console.log('✅ 40 sites par défaut initialisés dans SQLite (sites 22-61)');
  }
};

