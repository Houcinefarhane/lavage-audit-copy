#!/bin/bash

# Script pour créer un fichier ZIP partageable du projet
# Exclut les dossiers lourds (node_modules, dist, .git, etc.)

PROJECT_DIR="/Users/houcinefarhane/papa-app"
ZIP_NAME="lavage-audit-project.zip"
TEMP_DIR=$(mktemp -d)

echo "📦 Création d'un fichier ZIP partageable..."
echo ""

# Copier les fichiers nécessaires
echo "📋 Copie des fichiers..."
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.vercel' \
  --exclude='server/node_modules' \
  --exclude='server/database.sqlite' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='*.zip' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='server/.env' \
  "$PROJECT_DIR/" "$TEMP_DIR/lavage-audit/"

# Créer le ZIP
echo ""
echo "🗜️  Compression..."
cd "$TEMP_DIR"
zip -r "$PROJECT_DIR/$ZIP_NAME" lavage-audit/ -q

# Nettoyer
rm -rf "$TEMP_DIR"

# Afficher la taille
SIZE=$(du -h "$PROJECT_DIR/$ZIP_NAME" | cut -f1)
echo ""
echo "✅ ZIP créé : $ZIP_NAME"
echo "📊 Taille : $SIZE"
echo ""
echo "💡 Vous pouvez maintenant partager ce fichier via :"
echo "   - WeTransfer (wetransfer.com) - gratuit jusqu'à 2GB"
echo "   - Google Drive"
echo "   - Dropbox"
echo "   - GitHub (si le repo est privé, partagez l'accès)"


