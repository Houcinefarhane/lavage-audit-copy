import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Permet l'accès depuis le réseau local
    strictPort: true,
    // Autoriser tous les domaines Cloudflare pour le partage
    allowedHosts: [
      '.trycloudflare.com', // Autorise tous les sous-domaines Cloudflare
      'localhost',
      '127.0.0.1',
    ],
  },
})

