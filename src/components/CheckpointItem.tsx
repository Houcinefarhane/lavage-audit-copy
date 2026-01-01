import { Checkpoint, CheckpointStatus } from '../types';

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  onStatusChange: (id: string, status: CheckpointStatus) => void;
}

export const CheckpointItem = ({ checkpoint, onStatusChange }: CheckpointItemProps) => {
  const handleStatusChange = (status: CheckpointStatus) => {
    onStatusChange(checkpoint.id, status);
  };

  return (
    <div className="checkpoint-item">
      <label className="checkpoint-label">{checkpoint.label}</label>
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
      </div>
    </div>
  );
};

