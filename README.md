# TWIP Audit - Application d'Audit Qualité

Application web pour la gestion des audits qualité dans les centres de lavage automobile.

## Déploiement

Application déployée sur Vercel : **https://twip-audit.vercel.app**

## Technologies

- Frontend : React 18, TypeScript, Vite
- Backend : Node.js, Express (fonctions serverless Vercel)
- Base de données : Supabase (PostgreSQL)
- Graphiques : Recharts
- Animations : Framer Motion
- PDF : jsPDF
- Email : Brevo API

## Fonctionnalités

- Authentification par email/mot de passe
- Création et gestion d'audits qualité avec 17 points de contrôle
- Gestion de sites (ajout, modification, suppression)
- Tableau de bord avec KPIs et graphiques
- Génération de rapports PDF
- Envoi de rapports par email
- Synchronisation des données via Supabase
- Interface responsive (mobile et desktop)

## Installation locale

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Installer les dépendances du serveur
cd server
npm install
cd ..
```

### Configuration

1. Créer un fichier `server/.env` :

```env
SUPABASE_URL=https://onevlbtqovhsgqcsoqva.supabase.co
SUPABASE_ANON_KEY=votre_clé_anon
ADMIN_EMAIL=mohamed.farhane@wash.totalenergies.com
ADMIN_PASSWORD_HASH=votre_hash_mot_de_passe
BREVO_API_KEY=votre_clé_brevo
BREVO_FROM_EMAIL=votre_email@example.com
BREVO_FROM_NAME=Audit Qualité
```

2. Générer le hash du mot de passe :

```bash
cd server
node setup-password.js VOTRE_MOT_DE_PASSE
```

### Démarrage

```bash
# Terminal 1 : Backend
cd server
npm run dev

# Terminal 2 : Frontend
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Structure du projet

```
papa-app/
├── api/              # Fonctions serverless Vercel
├── src/              # Code source React
│   ├── components/   # Composants React
│   └── utils/        # Utilitaires
├── server/           # Backend Express (développement local)
├── dist/             # Build de production
└── vercel.json       # Configuration Vercel
```

## Points de contrôle

L'application vérifie 17 points de contrôle :
- Accueil souriant
- EPI & chaussures sécurité
- Zone de lavage propre
- PLV propres
- Machine OK
- Tornador/brosse OK
- Produits référencés
- Pulvérisateurs OK
- Barrières OK
- Meuble accueil OK
- Tenue Wash OK
- FeedbackNow OK
- Matériel rangé
- Trousse secours
- Local technique OK
- Rack OK
- Accueil tablette

## API

### Authentification

- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérification du token

### Audits

- `GET /api/audits` - Liste des audits
- `POST /api/audits` - Créer un audit
- `DELETE /api/audits/:id` - Supprimer un audit

### Sites

- `GET /api/sites` - Liste des sites
- `GET /api/sites/:id` - Détails d'un site
- `POST /api/sites` - Créer un site
- `PUT /api/sites/:id` - Modifier un site
- `DELETE /api/sites/:id` - Supprimer un site

### Email

- `POST /api/send-email` - Envoyer un rapport par email

## Déploiement

Le projet est configuré pour être déployé sur Vercel :

```bash
# Déployer
npx vercel --prod
```

Les variables d'environnement doivent être configurées dans le dashboard Vercel.

## Licence

Propriétaire - TotalEnergies
