# Configuration MCP Supabase - Guide Complet

## 🔍 Problème Actuel

Votre configuration MCP Supabase est incomplète : il manque un token d'authentification.

## ✅ Ce qu'il faut pour un MCP Supabase fonctionnel

### 1. Obtenir un Access Token Supabase

#### Option A : Personal Access Token (Recommandé pour développement)
1. Allez sur : https://supabase.com/dashboard/account/tokens
2. Cliquez sur **"Generate new token"**
3. Donnez-lui un nom : `MCP Cursor`
4. Copiez le token généré (il commence souvent par `sbp_`)

#### Option B : Service Role Key (Pour production - ⚠️ très sensible)
1. Allez sur : https://supabase.com/dashboard/project/tqvdjfesnavnsqchufjg/settings/api
2. Copiez la **"service_role" key** (⚠️ SECRÈTE - ne jamais la partager)

### 2. Configurer mcp.json

Mettez à jour votre fichier `~/.cursor/mcp.json` :

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=tqvdjfesnavnsqchufjg",
      "headers": {
        "Authorization": "Bearer VOTRE_TOKEN_ICI"
      }
    }
  }
}
```

**OU** si MCP Supabase utilise une configuration différente (selon version) :

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--project-ref", "tqvdjfesnavnsqchufjg",
        "--access-token", "VOTRE_TOKEN_ICI"
      ]
    }
  }
}
```

### 3. Redémarrer Cursor

**Important** : Après modification de `mcp.json`, vous devez :
1. Fermer complètement Cursor
2. Rouvrir Cursor
3. Les changements seront pris en compte

### 4. Vérifier la connexion

Une fois redémarré, vérifiez que le MCP Supabase fonctionne en listant les ressources disponibles.

## 📝 Informations de votre projet

- **Project Ref** : `tqvdjfesnavnsqchufjg` ✅ (déjà configuré)
- **Supabase URL** : `https://onevlbtqovhsgqcsoqva.supabase.co`

## ⚠️ Notes importantes

- ⚠️ Le Service Role Key a tous les privilèges - ne l'utilisez que si nécessaire
- ✅ Le Personal Access Token est plus sûr pour le développement
- 🔒 Ne commitez jamais ces tokens dans Git
- 📝 Stockez les tokens dans un gestionnaire de mots de passe sécurisé

## 🔗 Liens utiles

- Dashboard Supabase : https://supabase.com/dashboard/project/tqvdjfesnavnsqchufjg
- Tokens Account : https://supabase.com/dashboard/account/tokens
- API Settings : https://supabase.com/dashboard/project/tqvdjfesnavnsqchufjg/settings/api
