#!/bin/bash

# Script de configuration de l'email avec Resend
# Usage: ./setup-email.sh VOTRE_CLE_API_RESEND

if [ -z "$1" ]; then
  echo "❌ Erreur: Vous devez fournir votre clé API Resend"
  echo ""
  echo "Usage: ./setup-email.sh re_VOTRE_CLE_API"
  echo ""
  echo "Exemple: ./setup-email.sh re_abc123xyz456"
  exit 1
fi

RESEND_API_KEY="$1"

# Vérifier que la clé commence par "re_"
if [[ ! "$RESEND_API_KEY" =~ ^re_ ]]; then
  echo "⚠️  Attention: La clé API Resend commence généralement par 're_'"
  read -p "Continuer quand même? (o/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    exit 1
  fi
fi

# Créer le fichier .env avec toutes les variables
cat > .env << ENVFILE
# Configuration Supabase
SUPABASE_URL=https://onevlbtqovhsgqcsoqva.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZXZsYnRxb3Zoc2dxY3NvcXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc3NTEsImV4cCI6MjA4MTQ2Mzc1MX0.Dxnm1X33WDxfHm7ROsu-LLt2-icERkvc4LShy2on4E8

# Configuration Resend pour l'envoi d'emails
RESEND_API_KEY=${RESEND_API_KEY}
RESEND_FROM_EMAIL=Audit Qualité <onboarding@resend.dev>
ENVFILE

echo "✅ Fichier .env créé avec succès!"
echo ""
echo "📧 Clé API Resend configurée: ${RESEND_API_KEY:0:10}..."
echo ""
echo "🚀 Redémarrez le serveur pour appliquer les changements:"
echo "   cd /Users/houcinefarhane/papa-app/server"
echo "   npm run dev"
