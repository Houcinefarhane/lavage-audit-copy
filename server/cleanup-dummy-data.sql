-- Script de nettoyage pour supprimer les données factices (sites et audits inventés)
-- À exécuter dans l'éditeur SQL de Supabase
-- ATTENTION : Ce script supprime uniquement les données identifiées comme factices

-- 1. Identifier les audits factices (ceux avec des IDs "dummy-*" ou créés récemment avec des patterns suspects)
-- Les audits légitimes ont généralement des IDs basés sur des timestamps réels

-- Afficher les audits suspects pour vérification AVANT suppression
SELECT 
  id,
  date,
  siteid,
  score,
  comment,
  created_at
FROM audits
WHERE 
  id LIKE 'dummy-%'  -- IDs générés par dummyData.ts
  OR id LIKE 'trans-%'  -- IDs de transactions financières factices
  OR id LIKE 'eq-%'  -- IDs d'équipements factices
  OR id LIKE 'term-%'  -- IDs de terminaux factices
  OR id LIKE 'emp-%'  -- IDs d'employés factices
  OR id LIKE 'shift-%'  -- IDs de shifts factices
  OR id LIKE 'alert-%'  -- IDs d'alertes factices
  OR id LIKE 'pay-%'  -- IDs de paiements factices
  OR (comment LIKE '%auto%' OR comment LIKE '%dummy%' OR comment LIKE '%test%')
ORDER BY created_at DESC;

-- 2. Supprimer les audits factices identifiés
-- DÉCOMMENTER LA LIGNE SUIVANTE UNIQUEMENT APRÈS VÉRIFICATION
-- DELETE FROM audits
-- WHERE 
--   id LIKE 'dummy-%'
--   OR id LIKE 'trans-%'
--   OR id LIKE 'eq-%'
--   OR id LIKE 'term-%'
--   OR id LIKE 'emp-%'
--   OR id LIKE 'shift-%'
--   OR id LIKE 'alert-%'
--   OR id LIKE 'pay-%'
--   OR (comment LIKE '%auto%' OR comment LIKE '%dummy%' OR comment LIKE '%test%');

-- 3. Identifier les sites factices (ceux créés récemment avec des IDs suspects)
-- Les sites légitimes ont des IDs comme "site-022", "site-023", etc. (sites 22-61)
SELECT 
  id,
  name,
  city,
  created_at
FROM sites
WHERE 
  id NOT LIKE 'site-0%'  -- Les sites légitimes sont site-022 à site-061
  AND id NOT LIKE 'site-1%'
  AND id NOT LIKE 'site-2%'
  AND id NOT LIKE 'site-3%'
  AND id NOT LIKE 'site-4%'
  AND id NOT LIKE 'site-5%'
  AND id NOT LIKE 'site-6%'
  AND created_at > '2026-01-26'  -- Créés après mes modifications (ajuster la date si nécessaire)
ORDER BY created_at DESC;

-- 4. Supprimer les sites factices (ATTENTION : cela supprimera aussi les audits associés si ON DELETE CASCADE)
-- DÉCOMMENTER UNIQUEMENT APRÈS VÉRIFICATION
-- DELETE FROM sites
-- WHERE 
--   id NOT LIKE 'site-0%'
--   AND id NOT LIKE 'site-1%'
--   AND id NOT LIKE 'site-2%'
--   AND id NOT LIKE 'site-3%'
--   AND id NOT LIKE 'site-4%'
--   AND id NOT LIKE 'site-5%'
--   AND id NOT LIKE 'site-6%'
--   AND created_at > '2026-01-26';

-- 5. Vérifier les données des nouveaux modules (transactions financières, équipements, etc.)
-- Ces données sont stockées dans localStorage côté client, mais si elles ont été migrées en base :

-- Transactions financières factices
SELECT * FROM financial_transactions
WHERE id LIKE 'trans-%'
ORDER BY created_at DESC;

-- Équipements factices
SELECT * FROM equipments
WHERE id LIKE 'eq-%'
ORDER BY created_at DESC;

-- Terminaux factices
SELECT * FROM terminals
WHERE id LIKE 'term-%'
ORDER BY created_at DESC;

-- Employés factices
SELECT * FROM employees
WHERE id LIKE 'emp-%'
ORDER BY created_at DESC;

-- Shifts factices
SELECT * FROM employee_shifts
WHERE id LIKE 'shift-%'
ORDER BY created_at DESC;

-- Alertes factices
SELECT * FROM equipment_alerts
WHERE id LIKE 'alert-%'
ORDER BY created_at DESC;

-- Transactions de paiement factices
SELECT * FROM payment_transactions
WHERE id LIKE 'pay-%'
ORDER BY created_at DESC;

-- Pour supprimer ces données (DÉCOMMENTER APRÈS VÉRIFICATION) :
-- DELETE FROM financial_transactions WHERE id LIKE 'trans-%';
-- DELETE FROM equipments WHERE id LIKE 'eq-%';
-- DELETE FROM terminals WHERE id LIKE 'term-%';
-- DELETE FROM employees WHERE id LIKE 'emp-%';
-- DELETE FROM employee_shifts WHERE id LIKE 'shift-%';
-- DELETE FROM equipment_alerts WHERE id LIKE 'alert-%';
-- DELETE FROM payment_transactions WHERE id LIKE 'pay-%';
