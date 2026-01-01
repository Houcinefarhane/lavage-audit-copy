// Script pour configurer le mot de passe administrateur
// Usage: node setup-password.js VOTRE_MOT_DE_PASSE

import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const password = process.argv[2];

if (!password) {
  console.error('❌ Erreur: Vous devez fournir un mot de passe');
  console.log('');
  console.log('Usage: node setup-password.js VOTRE_MOT_DE_PASSE');
  console.log('');
  console.log('Exemple:');
  console.log('  node setup-password.js MonMotDePasse123!');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Erreur: Le mot de passe doit contenir au moins 8 caractères');
  process.exit(1);
}

// Hasher le mot de passe
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);

// Lire le fichier .env existant
const envPath = join(__dirname, '.env');
let envContent = '';

try {
  envContent = readFileSync(envPath, 'utf-8');
} catch (error) {
  // Le fichier .env n'existe pas, on le crée
  console.log('📝 Création du fichier .env...');
}

// Ajouter ou mettre à jour ADMIN_PASSWORD_HASH
const lines = envContent.split('\n');
let found = false;
const newLines = lines.map(line => {
  if (line.startsWith('ADMIN_PASSWORD_HASH=')) {
    found = true;
    return `ADMIN_PASSWORD_HASH=${hash}`;
  }
  return line;
});

if (!found) {
  newLines.push(`ADMIN_PASSWORD_HASH=${hash}`);
}

// Ajouter une ligne vide à la fin si nécessaire
if (newLines[newLines.length - 1] !== '') {
  newLines.push('');
}

// Écrire le fichier .env
writeFileSync(envPath, newLines.join('\n'));

console.log('');
console.log('✅ Mot de passe configuré avec succès !');
console.log('');
console.log('📧 Email: mohamed.farhane@wash.totalenergies.com');
console.log('🔐 Mot de passe: (celui que vous avez fourni)');
console.log('');
console.log('💡 Le hash du mot de passe a été ajouté dans server/.env');
console.log('   Redémarrez le serveur pour que les changements prennent effet.');
console.log('');

