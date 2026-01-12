import { useState } from 'react';
import Compressor from 'compressorjs';
import { supabase } from '../utils/supabaseClient';

interface PhotoUploadProps {
  checkpointId: string;
  auditId?: string;
  photos: string[];
  onPhotosChange: (checkpointId: string, photos: string[]) => void;
  onUploadStateChange?: (uploading: boolean) => void;
  maxPhotos?: number;
}

export const PhotoUpload = ({ 
  checkpointId, 
  auditId = 'temp',
  photos = [], 
  onPhotosChange,
  onUploadStateChange,
  maxPhotos = 3 
}: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        convertSize: 1000000, // 1MB
        success: (result) => {
          resolve(result as File);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= maxPhotos) {
      alert(`Maximum ${maxPhotos} photos autorisées par checkpoint`);
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB avant compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setUploading(true);
    onUploadStateChange?.(true);

    try {
      // Compression de l'image
      const compressedFile = await compressImage(file);

      // Créer un preview temporaire
      const tempUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(tempUrl);

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${auditId}/${checkpointId}/${timestamp}.${fileExt}`;

      // Upload vers Supabase Storage
      const { error } = await supabase.storage
        .from('audit-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique de l'image
      const { data: { publicUrl } } = supabase.storage
        .from('audit-photos')
        .getPublicUrl(fileName);

      // Mettre à jour les photos
      const newPhotos = [...photos, publicUrl];
      onPhotosChange(checkpointId, newPhotos);

      // Nettoyer le preview temporaire
      URL.revokeObjectURL(tempUrl);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      alert(`Erreur lors de l'upload: ${error.message || 'Erreur inconnue'}`);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setUploading(false);
      onUploadStateChange?.(false);
      // Réinitialiser l'input
      e.target.value = '';
    }
  };

  const handleDelete = async (photoUrl: string, index: number) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      // Extraire le chemin du fichier depuis l'URL publique Supabase
      // Format: https://[project].supabase.co/storage/v1/object/public/audit-photos/auditId/checkpointId/timestamp.ext
      const urlParts = photoUrl.split('/');
      const publicIndex = urlParts.findIndex(part => part === 'public');
      if (publicIndex >= 0 && publicIndex < urlParts.length - 1) {
        const fileName = urlParts.slice(publicIndex + 2).join('/'); // audit-photos/auditId/checkpointId/timestamp.ext
        const pathWithoutBucket = fileName.replace('audit-photos/', ''); // auditId/checkpointId/timestamp.ext

        // Supprimer de Supabase Storage
        const { error } = await supabase.storage
          .from('audit-photos')
          .remove([pathWithoutBucket]);

        if (error) {
          console.warn('Erreur lors de la suppression:', error);
          // Continuer quand même pour supprimer de l'interface
        }
      }

      // Mettre à jour les photos
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(checkpointId, newPhotos);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-upload-list">
        {photos.map((photo, index) => (
          <div key={index} className="photo-thumbnail">
            <img src={photo} alt={`Photo ${index + 1}`} />
            <button
              type="button"
              className="photo-delete-btn"
              onClick={() => handleDelete(photo, index)}
              title="Supprimer cette photo"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label className="photo-upload-btn">
            {uploading ? (
              <div className="photo-upload-spinner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Ajouter</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>
      {photos.length > 0 && (
        <div className="photo-upload-info">
          {photos.length}/{maxPhotos} photos
        </div>
      )}
    </div>
  );
};

