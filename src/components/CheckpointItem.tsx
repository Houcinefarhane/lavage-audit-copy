import { useState, useEffect } from 'react';
import { Checkpoint, CheckpointStatus } from '../types';
import { PhotoUpload } from './PhotoUpload';

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  onStatusChange: (id: string, status: CheckpointStatus) => void;
  onLabelChange?: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  auditId?: string;
  onPhotosChange?: (checkpointId: string, photos: string[]) => void;
  onUploadStateChange?: (uploading: boolean) => void;
}

export const CheckpointItem = ({ 
  checkpoint, 
  onStatusChange, 
  onLabelChange,
  onDelete,
  canDelete = false,
  auditId,
  onPhotosChange,
  onUploadStateChange
}: CheckpointItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(checkpoint.label);

  useEffect(() => {
    setEditedLabel(checkpoint.label);
  }, [checkpoint.label]);

  const handleStatusChange = (status: CheckpointStatus) => {
    onStatusChange(checkpoint.id, status);
  };

  const handleLabelBlur = () => {
    if (editedLabel.trim() && editedLabel !== checkpoint.label && onLabelChange) {
      onLabelChange(checkpoint.id, editedLabel.trim());
    } else if (!editedLabel.trim()) {
      setEditedLabel(checkpoint.label);
    }
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setEditedLabel(checkpoint.label);
      setIsEditing(false);
    }
  };

  return (
    <div className="checkpoint-item">
      <div className="checkpoint-item-header">
        <div className="checkpoint-label-container">
          {isEditing ? (
            <input
              type="text"
              className="checkpoint-label-input"
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              autoFocus
            />
          ) : (
            <label 
              className="checkpoint-label" 
              onClick={() => setIsEditing(true)}
              title="Cliquez pour modifier"
            >
              {checkpoint.label}
            </label>
          )}
        </div>
        <div className="checkpoint-buttons">
          <button
            className={`btn-status ${checkpoint.status === 'OUI' ? 'active yes' : ''}`}
            onClick={() => handleStatusChange('OUI')}
          >
            OUI
          </button>
          <button
            className={`btn-status ${checkpoint.status === 'NON' ? 'active no' : ''}`}
            onClick={() => handleStatusChange('NON')}
          >
            NON
          </button>
          {canDelete && onDelete && (
            <button
              className="btn-delete-checkpoint"
              onClick={() => onDelete(checkpoint.id)}
              title="Supprimer ce point de contrôle"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      {auditId && onPhotosChange && (
        <PhotoUpload
          checkpointId={checkpoint.id}
          auditId={auditId}
          photos={checkpoint.photos || []}
          onPhotosChange={onPhotosChange}
          onUploadStateChange={onUploadStateChange}
          maxPhotos={3}
        />
      )}
    </div>
  );
};

