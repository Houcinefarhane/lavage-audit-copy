#!/bin/bash

# Script pour démarrer les tunnels Cloudflare
# Usage: ./start-cloudflare.sh

echo "🚀 Démarrage des tunnels Cloudflare..."
echo ""

# Tuer les anciens tunnels
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# Démarrer le tunnel pour le frontend
echo "📱 Tunnel Frontend (port 3000) en cours de démarrage..."
cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Démarrer le tunnel pour le backend
echo "🔧 Tunnel Backend (port 3001) en cours de démarrage..."
cloudflared tunnel --url http://localhost:3001 > /tmp/cloudflared-backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

echo ""
echo "✅ Tunnels démarrés !"
echo ""
echo "📋 URLs Cloudflare (attendez quelques secondes pour qu'elles apparaissent) :"
echo ""
echo "Frontend:"
grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared-frontend.log 2>/dev/null | head -1 || echo "   En cours de génération... (vérifiez /tmp/cloudflared-frontend.log)"
echo ""
echo "Backend:"
grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared-backend.log 2>/dev/null | head -1 || echo "   En cours de génération... (vérifiez /tmp/cloudflared-backend.log)"
echo ""
echo "💡 Pour voir les URLs en temps réel :"
echo "   tail -f /tmp/cloudflared-frontend.log"
echo "   tail -f /tmp/cloudflared-backend.log"
echo ""
echo "🛑 Pour arrêter les tunnels :"
echo "   pkill -f 'cloudflared tunnel'"

