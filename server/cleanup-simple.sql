-- Script de nettoyage simple
-- Supprime les audits avec id commençant par "audit-test"
-- Supprime les sites dont le name ne commence pas par "NF"

-- ============================================================================
-- ÉTAPE 1 : VÉRIFICATION - Voir ce qui sera supprimé
-- ============================================================================

-- Voir les audits qui seront supprimés
SELECT 
  'AUDITS À SUPPRIMER' as type,
  id,
  date,
  siteid,
  score,
  createdat
FROM audits
WHERE id LIKE 'audit-test%'
ORDER BY createdat DESC;

-- Compter les audits à supprimer
SELECT COUNT(*) as nb_audits_a_supprimer 
FROM audits 
WHERE id LIKE 'audit-test%';

-- Voir les sites qui seront supprimés (ceux dont le name ne commence PAS par "NF")
SELECT 
  'SITES À SUPPRIMER' as type,
  id,
  name,
  city,
  createdat
FROM sites
WHERE name NOT LIKE 'NF%'
ORDER BY createdat DESC;

-- Compter les sites à supprimer
SELECT COUNT(*) as nb_sites_a_supprimer 
FROM sites 
WHERE name NOT LIKE 'NF%';

-- ============================================================================
-- ÉTAPE 2 : SUPPRESSION
-- ⚠️ DÉCOMMENTER UNIQUEMENT APRÈS VÉRIFICATION
-- ============================================================================

-- Supprimer les audits avec id commençant par "audit-test"
-- DELETE FROM audits WHERE id LIKE 'audit-test%';

-- Supprimer les sites dont le name ne commence pas par "NF"
-- ⚠️ ATTENTION : Cela supprimera aussi les audits liés à ces sites (si ON DELETE CASCADE)
-- DELETE FROM sites WHERE name NOT LIKE 'NF%';

-- ============================================================================
-- ÉTAPE 3 : VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier qu'il ne reste plus d'audits "audit-test"
SELECT COUNT(*) as audits_audit_test_restants 
FROM audits 
WHERE id LIKE 'audit-test%';

-- Vérifier qu'il ne reste que les sites commençant par "NF"
SELECT COUNT(*) as total_sites,
       COUNT(CASE WHEN name LIKE 'NF%' THEN 1 END) as sites_nf,
       COUNT(CASE WHEN name NOT LIKE 'NF%' THEN 1 END) as sites_non_nf
FROM sites;
