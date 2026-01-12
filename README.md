# Application d'Audit Qualité

Application web pour la gestion des audits qualité dans les centres de lavage automobile.

## Déploiement

Application déployée sur Vercel : **https://twip-audit.vercel.app**

## Stack Technique

- **Frontend** : React 18, TypeScript, Vite
- **Backend** : Node.js, Express (fonctions serverless Vercel)
- **Base de données** : Supabase (PostgreSQL)
- **Graphiques** : Recharts
- **Animations** : Framer Motion
- **PDF** : jsPDF
- **Email** : Brevo API

## Fonctionnalités

- Authentification par email/mot de passe
- Création et gestion d'audits qualité avec 17 points de contrôle
- Gestion de sites (ajout, modification, suppression)
- Tableau de bord avec KPIs et graphiques
- Génération de rapports PDF
- Envoi de rapports par email
- Synchronisation des données via Supabase
- Interface responsive (mobile et desktop)

## Installation

```bash
# Installer les dépendances
npm install
cd server && npm install && cd ..

# Configuration
# Créer server/.env avec les variables d'environnement nécessaires

# Démarrage
npm run dev          # Frontend
cd server && npm run dev  # Backend
```

## Structure

```
papa-app/
├── api/              # Fonctions serverless Vercel
├── src/              # Code source React
├── server/           # Backend Express (développement local)
└── dist/             # Build de production
```

## Licence

Propriétaire - TotalEnergies
