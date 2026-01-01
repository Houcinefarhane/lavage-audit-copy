// Netlify Function pour l'API backend
// Utilise un stockage en mémoire (pour démo) ou un service cloud

// Pour la production, vous devriez utiliser une vraie base de données cloud
// Options recommandées : Supabase (PostgreSQL), MongoDB Atlas, ou Upstash (Redis)

// Solution temporaire : stockage en mémoire (les données seront perdues au redémarrage)
// ⚠️ IMPORTANT : Pour la production, remplacez par une vraie base de données !

let memoryStore = {
  audits: [],
  sites: []
};

// Initialiser les sites par défaut
const initializeDefaultSites = () => {
  if (memoryStore.sites.length === 0) {
    memoryStore.sites = [
      { id: 'site-001', name: 'Centre Lavage Paris Centre', city: 'Paris' },
      { id: 'site-002', name: 'Centre Lavage Paris Nord', city: 'Paris' },
      { id: 'site-003', name: 'Centre Lavage Paris Sud', city: 'Paris' },
      { id: 'site-004', name: 'Centre Lavage Lyon Centre', city: 'Lyon' },
      { id: 'site-005', name: 'Centre Lavage Lyon Est', city: 'Lyon' },
      { id: 'site-006', name: 'Centre Lavage Marseille Port', city: 'Marseille' },
      { id: 'site-007', name: 'Centre Lavage Marseille Centre', city: 'Marseille' },
      { id: 'site-008', name: 'Centre Lavage Toulouse Nord', city: 'Toulouse' },
      { id: 'site-009', name: 'Centre Lavage Toulouse Sud', city: 'Toulouse' },
      { id: 'site-010', name: 'Centre Lavage Nice Promenade', city: 'Nice' },
      { id: 'site-011', name: 'Centre Lavage Nantes Centre', city: 'Nantes' },
      { id: 'site-012', name: 'Centre Lavage Nantes Est', city: 'Nantes' },
      { id: 'site-013', name: 'Centre Lavage Strasbourg Centre', city: 'Strasbourg' },
      { id: 'site-014', name: 'Centre Lavage Montpellier Centre', city: 'Montpellier' },
      { id: 'site-015', name: 'Centre Lavage Bordeaux Centre', city: 'Bordeaux' },
      { id: 'site-016', name: 'Centre Lavage Bordeaux Ouest', city: 'Bordeaux' },
      { id: 'site-017', name: 'Centre Lavage Lille Centre', city: 'Lille' },
      { id: 'site-018', name: 'Centre Lavage Lille Sud', city: 'Lille' },
      { id: 'site-019', name: 'Centre Lavage Rennes Centre', city: 'Rennes' },
      { id: 'site-020', name: 'Centre Lavage Reims Centre', city: 'Reims' },
      { id: 'site-021', name: 'Centre Lavage Le Havre Port', city: 'Le Havre' },
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
  }
};

// Initialiser au démarrage
initializeDefaultSites();

export const handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // ROUTES AUDITS
    if (path === '/audits' && method === 'GET') {
      const { siteId } = event.queryStringParameters || {};
      let audits = [...memoryStore.audits];
      
      if (siteId && siteId !== 'all') {
        audits = audits.filter(a => a.siteId === siteId);
      }
      
      audits.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(audits),
      };
    }

    if (path === '/audits' && method === 'POST') {
      const { id, date, siteId, score, totalCheckpoints, comment, checkpoints } = body;
      
      if (!id || !date || !siteId || score === undefined || !checkpoints) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Données manquantes' }),
        };
      }

      const audit = {
        id,
        date,
        siteId,
        score,
        totalCheckpoints,
        comment: comment || null,
        checkpoints,
      };

      memoryStore.audits.push(audit);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, id }),
      };
    }

    if (path.startsWith('/audits/') && method === 'DELETE') {
      const id = path.split('/')[2];
      const index = memoryStore.audits.findIndex(a => a.id === id);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Audit non trouvé' }),
        };
      }

      memoryStore.audits.splice(index, 1);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // ROUTES SITES
    if (path === '/sites' && method === 'GET') {
      const sites = [...memoryStore.sites].sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sites),
      };
    }

    if (path.startsWith('/sites/') && method === 'GET') {
      const id = path.split('/')[2];
      const site = memoryStore.sites.find(s => s.id === id);
      
      if (!site) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Site non trouvé' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(site),
      };
    }

    if (path === '/sites' && method === 'POST') {
      const { name, city } = body;
      
      if (!name || !city) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Nom et ville requis' }),
        };
      }

      const id = `site-${Date.now()}`;
      const site = { id, name, city };
      
      memoryStore.sites.push(site);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(site),
      };
    }

    if (path.startsWith('/sites/') && method === 'PUT') {
      const id = path.split('/')[2];
      const { name, city } = body;
      
      if (!name || !city) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Nom et ville requis' }),
        };
      }

      const index = memoryStore.sites.findIndex(s => s.id === id);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Site non trouvé' }),
        };
      }

      memoryStore.sites[index] = { id, name, city };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id, name, city }),
      };
    }

    if (path.startsWith('/sites/') && method === 'DELETE') {
      const id = path.split('/')[2];
      
      // Vérifier si le site a des audits
      const hasAudits = memoryStore.audits.some(a => a.siteId === id);
      
      if (hasAudits) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Impossible de supprimer ce site car il contient des audits enregistrés' 
          }),
        };
      }

      const index = memoryStore.sites.findIndex(s => s.id === id);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Site non trouvé' }),
        };
      }

      memoryStore.sites.splice(index, 1);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // HEALTH CHECK
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
      };
    }

    // Route non trouvée
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route non trouvée' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur' }),
    };
  }
};
