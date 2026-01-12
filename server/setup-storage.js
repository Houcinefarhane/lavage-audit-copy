#!/usr/bin/env node

/**
 * Script pour configurer le bucket Supabase Storage et les policies
 * 
 * Usage: node setup-storage.js
 * 
 * Prerequisites:
 * - Avoir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans server/.env
 * - OU utiliser les valeurs par défaut du projet
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://onevlbtqovhsgqcsoqva.supabase.co';
// Pour les opérations de Storage (création bucket, policies), on a besoin de la service_role key
// L'anon key ne suffit pas pour créer des buckets
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY requis');
  console.error('   Ajoutez SUPABASE_SERVICE_ROLE_KEY dans server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'audit-photos';

async function setupStorage() {
  console.log('🔧 Configuration du bucket Supabase Storage...\n');

  try {
    // 1. Vérifier si le bucket existe
    console.log(`1️⃣  Vérification du bucket "${BUCKET_NAME}"...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la liste des buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`✅ Le bucket "${BUCKET_NAME}" existe déjà\n`);
    } else {
      // 2. Créer le bucket
      console.log(`2️⃣  Création du bucket "${BUCKET_NAME}"...`);
      const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Public bucket pour lecture publique
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        console.error('❌ Erreur lors de la création du bucket:', createError);
        throw createError;
      }

      console.log(`✅ Bucket "${BUCKET_NAME}" créé avec succès\n`);
    }

    // 3. Afficher les instructions pour les policies
    console.log('3️⃣  Configuration des policies Storage\n');
    console.log('⚠️  Les policies Storage doivent être configurées via le Dashboard Supabase:');
    console.log('   1. Allez sur https://supabase.com/dashboard/project/onevlbtqovhsgqcsoqva/storage/policies');
    console.log(`   2. Sélectionnez le bucket "${BUCKET_NAME}"`);
    console.log('   3. Cliquez sur "New Policy" et ajoutez les policies suivantes:\n');
    
    console.log('📋 Policy 1: Upload (authenticated only)');
    console.log('   Policy name: Allow authenticated uploads');
    console.log('   Allowed operation: INSERT');
    console.log('   Target roles: authenticated');
    console.log('   Policy definition:');
    console.log('   - Using expression: bucket_id = \'' + BUCKET_NAME + '\'');
    console.log('   - With check expression: bucket_id = \'' + BUCKET_NAME + '\'\n');
    
    console.log('📋 Policy 2: Read (public)');
    console.log('   Policy name: Allow public read');
    console.log('   Allowed operation: SELECT');
    console.log('   Target roles: public');
    console.log('   Policy definition:');
    console.log('   - Using expression: bucket_id = \'' + BUCKET_NAME + '\'\n');
    
    console.log('📋 Policy 3: Delete (authenticated only)');
    console.log('   Policy name: Allow authenticated deletes');
    console.log('   Allowed operation: DELETE');
    console.log('   Target roles: authenticated');
    console.log('   Policy definition:');
    console.log('   - Using expression: bucket_id = \'' + BUCKET_NAME + '\'\n');

    console.log('✅ Configuration terminée!');
    console.log('\n💡 Note: Si vous avez la service_role key, vous pouvez aussi créer les policies');
    console.log('   programmatiquement via l\'API Supabase Management.');

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

setupStorage();

