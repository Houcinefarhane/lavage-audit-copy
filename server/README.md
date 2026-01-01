# Backend Server - Papa App

## Installation

```bash
cd server
npm install
```

## Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3001` par défaut.

## Configuration

Vous pouvez changer le port en définissant la variable d'environnement `PORT` :

```bash
PORT=4000 npm start
```

## API Endpoints

### Audits

- `GET /api/audits` - Récupérer tous les audits
  - Query params: `?siteId=xxx` pour filtrer par site
- `POST /api/audits` - Créer un nouvel audit
- `DELETE /api/audits/:id` - Supprimer un audit

### Sites

- `GET /api/sites` - Récupérer tous les sites
- `GET /api/sites/:id` - Récupérer un site par ID
- `POST /api/sites` - Créer un nouveau site
- `PUT /api/sites/:id` - Mettre à jour un site
- `DELETE /api/sites/:id` - Supprimer un site

### Santé

- `GET /api/health` - Vérifier l'état du serveur

## Base de données

La base de données SQLite est créée automatiquement dans `server/database.sqlite` lors du premier démarrage.

Les 60 sites par défaut sont initialisés automatiquement si la base est vide.

## Configuration Frontend

Pour que le frontend se connecte au backend, créez un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3001/api
```

Ou modifiez directement `src/utils/api.ts` si vous préférez.

## Configuration de l'envoi d'emails en local

Pour envoyer de vrais emails en développement local :

1. **Créer un compte Resend** : https://resend.com
2. **Obtenir votre clé API** :
   - Allez dans Settings → API Keys
   - Créez une nouvelle clé API
3. **Configurer le fichier .env** :
   ```bash
   cd server
   cp .env.example .env
   ```
   Puis éditez `.env` et ajoutez votre clé API :
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   ```
4. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

**Note** : Si `RESEND_API_KEY` n'est pas configuré, le serveur fonctionnera en mode simulation (les emails seront loggés dans la console mais pas envoyés).

## Déploiement

### Option 1: Vercel / Netlify (Serverless)

Vous devrez adapter le code pour utiliser une base de données cloud (PostgreSQL, MongoDB, etc.) car SQLite ne fonctionne pas en serverless.

### Option 2: Serveur VPS / Cloud

1. Installez Node.js sur votre serveur
2. Clonez le projet
3. Installez les dépendances : `npm install`
4. Démarrez avec PM2 : `pm2 start index.js --name papa-app-backend`
5. Configurez un reverse proxy (Nginx) pour exposer le serveur

### Option 3: Docker

Créez un `Dockerfile` :

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Puis :

```bash
docker build -t papa-app-backend .
docker run -p 3001:3001 papa-app-backend
```

