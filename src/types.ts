export type CheckpointStatus = 'OUI' | 'NON' | null;

export interface Checkpoint {
  id: string;
  label: string;
  status: CheckpointStatus;
}

export interface Audit {
  id: string;
  date: string;
  siteId: string;
  comment?: string;
  checkpoints: Checkpoint[];
  score: number;
  totalCheckpoints: number;
}

export const CHECKPOINTS: Omit<Checkpoint, 'status'>[] = [
  { id: 'accueil-souriant', label: 'Accueil souriant' },
  { id: 'epi-chaussures', label: 'EPI & chaussures sécurité' },
  { id: 'zone-lavage-propre', label: 'Zone de lavage propre' },
  { id: 'plv-propres', label: 'PLV propres' },
  { id: 'machine-ok', label: 'Machine OK' },
  { id: 'tornador-brosse-ok', label: 'Tornador/brosse OK' },
  { id: 'produits-references', label: 'Produits référencés' },
  { id: 'pulverisateurs-ok', label: 'Pulvérisateurs OK' },
  { id: 'barrieres-ok', label: 'Barrières OK' },
  { id: 'meuble-accueil-ok', label: 'Meuble accueil OK' },
  { id: 'tenue-wash-ok', label: 'Tenue Wash OK' },
  { id: 'feedback-now-ok', label: 'FeedbackNow OK' },
  { id: 'materiel-range', label: 'Matériel rangé' },
  { id: 'trousse-secours', label: 'Trousse secours' },
  { id: 'local-technique-ok', label: 'Local technique OK' },
  { id: 'rack-ok', label: 'Rack OK' },
  { id: 'accueil-tablette', label: 'Accueil tablette' },
];

