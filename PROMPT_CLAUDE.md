# Prompt pour Claude - Plateforme Gestion Multi-Sites pour Franchisés Lavage

## Contexte et But de l'Application

Cette application web est une **plateforme complète de gestion multi-sites** spécialement conçue pour les **franchisés de centres de lavage automobile**. Elle permet de gérer l'ensemble des aspects opérationnels, financiers, techniques et humains d'un réseau de centres de lavage.

L'application a évolué d'une simple solution d'audit qualité vers une plateforme intégrée permettant aux franchisés de :
- Suivre la qualité opérationnelle de leurs sites
- Gérer les finances et le chiffre d'affaires
- Superviser les équipements et la maintenance
- Intégrer les paiements depuis les terminaux
- Gérer les ressources humaines
- Comparer les performances entre sites

## Architecture Technique

- **Frontend** : React 18 avec TypeScript, Vite comme build tool
- **Backend** : Node.js avec Express (déployé en fonctions serverless sur Vercel)
- **Base de données** : Supabase (PostgreSQL)
- **Bibliothèques principales** :
  - Recharts pour les graphiques et visualisations
  - Framer Motion pour les animations
  - jsPDF pour la génération de rapports PDF
  - Brevo API pour l'envoi d'emails
  - Supabase Client pour la synchronisation des données

## Fonctionnalités Principales

### 1. Authentification et Sécurité
- **Système d'authentification** par email et mot de passe
- Vérification du token JWT à chaque requête
- Gestion de session avec stockage local sécurisé
- Déconnexion avec nettoyage des données de session

### 2. Gestion des Sites
- **Création, modification et suppression de sites** (centres de lavage)
- Chaque site possède :
  - Un nom unique
  - Un identifiant unique
  - Des informations de localisation
- Les sites sont utilisés pour associer chaque audit à un centre de lavage spécifique
- Filtrage des audits par site dans le tableau de bord

### 3. Création d'Audits Qualité
- **Formulaire d'audit structuré** avec **17 points de contrôle** standardisés :
  1. Accueil souriant
  2. EPI & chaussures sécurité
  3. Zone de lavage propre
  4. PLV propres
  5. Machine OK
  6. Tornador/brosse OK
  7. Produits référencés
  8. Pulvérisateurs OK
  9. Barrières OK
  10. Meuble accueil OK
  11. Tenue Wash OK
  12. FeedbackNow OK
  13. Matériel rangé
  14. Trousse secours
  15. Local technique OK
  16. Rack OK
  17. Accueil tablette

- **Système d'évaluation** : Chaque point de contrôle peut être marqué comme :
  - **OUI** (conforme)
  - **NON** (non conforme)
  - **Non évalué** (null)

- **Upload de photos** : Possibilité d'ajouter des photos pour chaque point de contrôle pour documenter visuellement les constats
- **Commentaires** : Champ de commentaire libre pour chaque audit
- **Calcul automatique du score** : Le score est calculé en pourcentage basé sur le nombre de points "OUI" par rapport au total des points évalués
- **Sélection du site** : Chaque audit est associé à un site spécifique

### 4. Tableau de Bord Analytique
Le tableau de bord fournit une vue d'ensemble complète avec :

#### Indicateurs Clés de Performance (KPIs)
- **Total des audits** : Nombre total d'audits réalisés
- **Score moyen** : Score moyen calculé sur tous les audits
- **Audits aujourd'hui** : Nombre d'audits effectués le jour même
- **Audits excellents** : Nombre d'audits avec un score ≥ 80%

#### Graphiques et Visualisations
- **Évolution du score sur 30 jours** : Graphique linéaire montrant la tendance du score moyen quotidien
- **Répartition OUI/NON** : Graphique en barres montrant le nombre de points "OUI" vs "NON" par jour sur 30 jours
- **Répartition des audits par score** : Graphique en camembert avec trois catégories :
  - Excellent (≥80%)
  - Bon (60-79%)
  - À améliorer (<60%)
- **Top 5 points de contrôle les plus problématiques** : Graphique en barres horizontales identifiant les points de contrôle les plus souvent marqués "NON"
- **Évolution du score moyen par site** : Graphique linéaire multi-lignes montrant l'évolution du score moyen cumulé pour les 10 sites les plus actifs

#### Filtrage
- **Filtre par site** : Possibilité de filtrer toutes les statistiques et graphiques par site spécifique ou voir tous les sites

### 5. Historique des Audits
- **Liste complète de tous les audits** réalisés
- Affichage des informations clés : date, site, score, nombre de points conformes
- **Actions disponibles** :
  - Visualisation détaillée de chaque audit
  - **Génération de rapport PDF** pour chaque audit
  - **Envoi du rapport par email** (via Brevo API)
- Tri et recherche facilités

### 6. Génération de Rapports PDF
- **Export PDF** de chaque audit avec :
  - Informations du site audité
  - Date de l'audit
  - Liste complète des 17 points de contrôle avec leur statut (OUI/NON)
  - Photos associées aux points de contrôle (si disponibles)
  - Score global et commentaires
  - Mise en page professionnelle et lisible

### 7. Envoi d'Emails
- **Envoi automatique de rapports** par email via l'API Brevo
- Le rapport PDF est joint à l'email
- Permet de partager facilement les résultats d'audit avec les responsables

### 8. Synchronisation des Données
- **Synchronisation avec Supabase** : Toutes les données (audits, sites, utilisateurs) sont stockées et synchronisées via Supabase
- Accès multi-appareils : Les données sont accessibles depuis n'importe quel appareil connecté
- Sauvegarde automatique et sécurisée

### 9. Module Finance & Chiffre d'Affaires
- **Suivi des transactions** : Enregistrement des revenus et dépenses par site
- **Catégorisation** : Transactions classées par catégorie (lavage, maintenance, salaires, etc.)
- **Périodes flexibles** : Analyse par jour, semaine, mois ou année
- **Graphiques d'évolution** : Visualisation des revenus et dépenses dans le temps
- **Comparaison multi-sites** : Comparaison du CA entre différents sites
- **Calcul automatique** : Bénéfice = Revenus - Dépenses
- **Export et reporting** : Données disponibles pour analyses approfondies

### 10. Module Gestion des Équipements
- **Inventaire complet** : Enregistrement de tous les équipements par site (terminaux, machines, pompes, aspirateurs)
- **Suivi de maintenance** : Dates de dernière et prochaine maintenance
- **Statuts en temps réel** : Opérationnel, en maintenance, en panne, avertissement
- **Système d'alertes intelligent** :
  - Alertes critiques pour pannes
  - Alertes haute priorité pour maintenance en retard
  - Alertes moyenne priorité pour maintenance à venir (7 jours)
  - Alertes basse priorité pour maintenance prévue (30 jours)
- **Résolution d'alertes** : Marquage des alertes comme résolues
- **Statistiques** : Vue d'ensemble du taux opérationnel des équipements

### 11. Tableau Comparatif Multi-Sites
- **Métriques comparatives** : Score qualité, CA, nombre d'audits, taux opérationnel
- **Classement dynamique** : Tri des sites selon différentes métriques
- **Périodes configurables** : Comparaison sur 7 jours, 30 jours, 3 mois ou 1 an
- **Graphiques comparatifs** : Visualisation des performances par site
- **Vue d'ensemble multi-métriques** : Graphique combinant plusieurs indicateurs
- **Statistiques agrégées** : Meilleur site, moyenne, écart-type
- **Tableau de classement** : Classement visuel avec badges de rang

### 12. Module Intégration Paiements
- **Gestion des terminaux** : Enregistrement et suivi des terminaux de paiement
- **Types de terminaux** : Terminaux de paiement, bornes interactives, applications mobiles
- **Synchronisation** : Import des transactions depuis les terminaux (simulation disponible)
- **Transactions détaillées** :
  - Date et heure précises
  - Montant et mode de paiement (carte, espèces, mobile)
  - Type de service (Lavage Express, Premium, Aspiration, Combo)
  - ID de transaction unique
- **Statistiques en temps réel** :
  - CA total et CA du jour
  - Répartition par mode de paiement
  - Répartition par type de service
  - Évolution sur 7 jours
- **Historique complet** : Toutes les transactions avec filtrage par site

### 13. Module Ressources Humaines
- **Gestion des employés** :
  - Informations personnelles (nom, prénom, email, téléphone)
  - Poste (Manager, Opérateur, Technicien, Autre)
  - Date d'embauche et statut (Actif, Inactif, En congé)
  - Salaire mensuel
  - Notes et commentaires
- **Gestion des shifts** :
  - Enregistrement des horaires de travail
  - Calcul automatique des heures travaillées
  - Association employé-site-date
  - Notes par shift
- **Statistiques RH** :
  - Nombre total d'employés par site
  - Répartition par poste
  - Masse salariale totale
  - Heures travaillées par mois
- **Graphiques** : Visualisation de la répartition des employés par poste et par site

### 14. Interface Responsive
- **Design adaptatif** : L'interface s'adapte aux écrans mobiles, tablettes et desktop
- **Navigation intuitive** : Menu avec 9 modules principaux
- **Animations fluides** : Framer Motion pour une meilleure expérience utilisateur
- **Tableaux responsives** : Scroll horizontal sur petits écrans

## Flux Utilisateur Typique

1. **Connexion** : L'utilisateur se connecte avec son email et mot de passe
2. **Consultation du tableau de bord** : Visualisation des statistiques globales et tendances
3. **Création d'un audit** :
   - Sélection du site à auditer
   - Évaluation des 17 points de contrôle (OUI/NON)
   - Ajout de photos si nécessaire
   - Ajout de commentaires
   - Sauvegarde de l'audit
4. **Consultation de l'historique** : Vérification des audits précédents
5. **Génération et envoi** : Export PDF et envoi par email si nécessaire

## Objectifs Métier

- **Standardisation** : Assurer une évaluation uniforme de la qualité dans tous les centres de lavage
- **Traçabilité** : Conserver un historique complet de tous les audits réalisés
- **Amélioration continue** : Identifier les points de contrôle problématiques récurrents pour cibler les actions correctives
- **Reporting** : Faciliter la génération et le partage de rapports d'audit
- **Analyse de tendances** : Suivre l'évolution de la qualité dans le temps et par site

## Points d'Attention pour le Développement

- L'application utilise un système de stockage hybride (localStorage + Supabase)
- Les photos sont compressées avant upload pour optimiser les performances
- L'authentification est gérée via JWT avec vérification côté serveur
- Les données sont filtrées et calculées en temps réel dans le tableau de bord
- L'application est déployée sur Vercel avec des fonctions serverless
