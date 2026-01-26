-- Script de nettoyage SÉCURISÉ pour supprimer UNIQUEMENT les données factices
-- À exécuter dans l'éditeur SQL de Supabase
-- 
-- ÉTAPE 1 : VÉRIFICATION - Exécutez d'abord les SELECT pour voir ce qui sera supprimé
-- ÉTAPE 2 : Si les résultats sont corrects, décommentez les DELETE correspondants

-- ============================================================================
-- PARTIE 1 : IDENTIFIER LES AUDITS FACTICES
-- ============================================================================

-- Les audits factices ont généralement :
-- - Des IDs commençant par "dummy-"
-- - Des commentaires contenant "auto", "dummy", "test"
-- - Des IDs générés automatiquement avec des timestamps récents suspects

-- Afficher les audits suspects (IDs "dummy-*" ou siteid commençant par "site-test")
SELECT 
  'AUDITS FACTICES' as type,
  id,
  date,
  siteid,
  score,
  LEFT(comment, 50) as comment_preview,
  createdat
FROM audits
WHERE 
  id LIKE 'dummy-%'
  OR siteid LIKE 'site-test%'
ORDER BY createdat DESC;

-- Compter combien seront supprimés
SELECT COUNT(*) as nb_audits_factices 
FROM audits 
WHERE 
  id LIKE 'dummy-%'
  OR siteid LIKE 'site-test%';

-- ============================================================================
-- PARTIE 2 : IDENTIFIER LES SITES FACTICES
-- ============================================================================

-- Les sites légitimes ont des IDs comme :
-- - site-022, site-023, ..., site-061 (sites 22 à 61)
-- 
-- Les sites factices ont généralement :
-- - Des IDs générés avec Date.now() : "site-1737..." (timestamp)
-- - Créés après le 26 janvier 2026 (date de mes modifications)

-- Afficher les sites suspects (ceux qui commencent par "site-test" ou ne sont PAS dans la liste légitime)
SELECT 
  'SITES FACTICES' as type,
  id,
  name,
  city,
  createdat
FROM sites
WHERE 
  -- Sites commençant par "site-test"
  id LIKE 'site-test%'
  -- OU sites qui ne sont PAS dans la liste légitime et créés récemment
  OR (
    id NOT IN (
      'site-022', 'site-023', 'site-024', 'site-025', 'site-026', 'site-027', 'site-028', 'site-029', 'site-030',
      'site-031', 'site-032', 'site-033', 'site-034', 'site-035', 'site-036', 'site-037', 'site-038', 'site-039', 'site-040',
      'site-041', 'site-042', 'site-043', 'site-044', 'site-045', 'site-046', 'site-047', 'site-048', 'site-049', 'site-050',
      'site-051', 'site-052', 'site-053', 'site-054', 'site-055', 'site-056', 'site-057', 'site-058', 'site-059', 'site-060'
    )
    -- ET créés après le 26 janvier 2026 (ajuster si nécessaire)
    AND createdat > '2026-01-26 00:00:00'
  )
ORDER BY createdat DESC;

-- Compter combien seront supprimés
SELECT COUNT(*) as nb_sites_factices 
FROM sites
WHERE 
  id LIKE 'site-test%'
  OR (
    id NOT IN (
      'site-022', 'site-023', 'site-024', 'site-025', 'site-026', 'site-027', 'site-028', 'site-029', 'site-030',
      'site-031', 'site-032', 'site-033', 'site-034', 'site-035', 'site-036', 'site-037', 'site-038', 'site-039', 'site-040',
      'site-041', 'site-042', 'site-043', 'site-044', 'site-045', 'site-046', 'site-047', 'site-048', 'site-049', 'site-050',
      'site-051', 'site-052', 'site-053', 'site-054', 'site-055', 'site-056', 'site-057', 'site-058', 'site-059', 'site-060'
    )
    AND createdat > '2026-01-26 00:00:00'
  );

-- ============================================================================
-- PARTIE 3 : VÉRIFIER LES AUDITS LIÉS AUX SITES FACTICES
-- ============================================================================

-- Avant de supprimer les sites, voir quels audits seront affectés
SELECT 
  'AUDITS LIÉS AUX SITES FACTICES' as type,
  a.id as audit_id,
  a.date,
  a.siteid,
  a.score,
  s.name as site_name,
  a.createdat
FROM audits a
JOIN sites s ON a.siteid = s.id
WHERE 
  s.id NOT IN (
    'site-022', 'site-023', 'site-024', 'site-025', 'site-026', 'site-027', 'site-028', 'site-029', 'site-030',
    'site-031', 'site-032', 'site-033', 'site-034', 'site-035', 'site-036', 'site-037', 'site-038', 'site-039', 'site-040',
    'site-041', 'site-042', 'site-043', 'site-044', 'site-045', 'site-046', 'site-047', 'site-048', 'site-049', 'site-050',
    'site-051', 'site-052', 'site-053', 'site-054', 'site-055', 'site-056', 'site-057', 'site-058', 'site-059', 'site-060'
  )
  AND s.createdat > '2026-01-26 00:00:00'
ORDER BY a.createdat DESC;

-- ============================================================================
-- PARTIE 4 : SUPPRESSION (DÉCOMMENTER UNIQUEMENT APRÈS VÉRIFICATION)
-- ============================================================================

-- ⚠️ ATTENTION : Exécutez d'abord toutes les requêtes SELECT ci-dessus
-- ⚠️ Vérifiez que seules les données factices seront supprimées
-- ⚠️ Décommentez les DELETE ci-dessous UNIQUEMENT si vous êtes sûr

-- 1. Supprimer les audits factices (IDs "dummy-*" ou siteid commençant par "site-test")
-- DELETE FROM audits 
-- WHERE 
--   id LIKE 'dummy-%'
--   OR siteid LIKE 'site-test%';

-- 2. Supprimer les audits liés aux sites factices (si ON DELETE CASCADE n'est pas activé)
-- DELETE FROM audits 
-- WHERE siteid IN (
--   SELECT id FROM sites
--   WHERE 
--     id NOT IN (
--       'site-022', 'site-023', 'site-024', 'site-025', 'site-026', 'site-027', 'site-028', 'site-029', 'site-030',
--       'site-031', 'site-032', 'site-033', 'site-034', 'site-035', 'site-036', 'site-037', 'site-038', 'site-039', 'site-040',
--       'site-041', 'site-042', 'site-043', 'site-044', 'site-045', 'site-046', 'site-047', 'site-048', 'site-049', 'site-050',
--       'site-051', 'site-052', 'site-053', 'site-054', 'site-055', 'site-056', 'site-057', 'site-058', 'site-059', 'site-060'
--     )
--     AND createdat > '2026-01-26 00:00:00'
-- );

-- 3. Supprimer les sites factices (ceux commençant par "site-test" ou autres sites factices)
-- DELETE FROM sites
-- WHERE 
--   id LIKE 'site-test%'
--   OR (
--     id NOT IN (
--       'site-022', 'site-023', 'site-024', 'site-025', 'site-026', 'site-027', 'site-028', 'site-029', 'site-030',
--       'site-031', 'site-032', 'site-033', 'site-034', 'site-035', 'site-036', 'site-037', 'site-038', 'site-039', 'site-040',
--       'site-041', 'site-042', 'site-043', 'site-044', 'site-045', 'site-046', 'site-047', 'site-048', 'site-049', 'site-050',
--       'site-051', 'site-052', 'site-053', 'site-054', 'site-055', 'site-056', 'site-057', 'site-058', 'site-059', 'site-060'
--     )
--     AND createdat > '2026-01-26 00:00:00'
--   );

-- ============================================================================
-- PARTIE 5 : VÉRIFICATION FINALE
-- ============================================================================

-- Après suppression, vérifier qu'il ne reste que les sites légitimes
SELECT COUNT(*) as total_sites, 
       COUNT(CASE WHEN id IN ('site-022', 'site-023', 'site-024', 'site-025', 'site-026', 'site-027', 'site-028', 'site-029', 'site-030',
                              'site-031', 'site-032', 'site-033', 'site-034', 'site-035', 'site-036', 'site-037', 'site-038', 'site-039', 'site-040',
                              'site-041', 'site-042', 'site-043', 'site-044', 'site-045', 'site-046', 'site-047', 'site-048', 'site-049', 'site-050',
                              'site-051', 'site-052', 'site-053', 'site-054', 'site-055', 'site-056', 'site-057', 'site-058', 'site-059', 'site-060') THEN 1 END) as sites_legitimes
FROM sites;

-- Vérifier qu'il ne reste plus d'audits factices
SELECT COUNT(*) as audits_factices_restants 
FROM audits 
WHERE 
  id LIKE 'dummy-%'
  OR siteid LIKE 'site-test%';
