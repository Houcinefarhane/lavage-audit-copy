#!/usr/bin/env node

/**
 * Script pour créer le bucket Supabase Storage audit-photos
 * 
 * Usage: node create-storage-bucket.js
 * 
 * Prerequisites:
 * - Avoir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans server/.env
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
// Pour créer un bucket, on a besoin de la service_role key (pas l'anon key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY requis dans server/.env');
  console.error('   Obtenez-la sur: https://supabase.com/dashboard/project/onevlbtqovhsgqcsoqva/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'audit-photos';

async function createBucket() {
  console.log('🔧 Création du bucket Supabase Storage...\n');

  try {
    // 1. Vérifier si le bucket existe déjà
    console.log(`1️⃣  Vérification du bucket "${BUCKET_NAME}"...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la liste des buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`✅ Le bucket "${BUCKET_NAME}" existe déjà\n`);
      console.log('📋 Prochaines étapes:');
      console.log('   1. Les policies Storage ont été créées via la migration SQL');
      console.log('   2. Vous pouvez maintenant tester l\'upload de photos');
      return;
    }

    // 2. Créer le bucket
    console.log(`2️⃣  Création du bucket "${BUCKET_NAME}"...`);
    const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // Public bucket pour lecture publique
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (createError) {
      console.error('❌ Erreur lors de la création du bucket:', createError);
      
      if (createError.message.includes('permission') || createError.message.includes('row-level security')) {
        console.error('\n💡 Solution: Créez le bucket manuellement dans le Dashboard Supabase:');
        console.error('   1. Allez sur: https://supabase.com/dashboard/project/onevlbtqovhsgqcsoqva/storage/buckets');
        console.error(`   2. Cliquez sur "New bucket"`);
        console.error(`   3. Nom: ${BUCKET_NAME}`);
        console.error(`   4. Public: ✅ Activé`);
        console.error(`   5. Cliquez sur "Create bucket"`);
        console.error('\n   Ensuite, réexécutez ce script pour créer les policies.');
      }
      throw createError;
    }

    console.log(`✅ Bucket "${BUCKET_NAME}" créé avec succès !\n`);
    console.log('📋 Configuration:');
    console.log(`   - Nom: ${BUCKET_NAME}`);
    console.log('   - Public: ✅ Activé');
    console.log('   - Types MIME autorisés: image/jpeg, image/jpg, image/png, image/webp');
    console.log('   - Taille max: 5MB\n');
    
    console.log('✅ Les policies Storage ont été créées via la migration SQL');
    console.log('🎉 Tout est prêt pour l\'upload de photos !');

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

createBucket();

