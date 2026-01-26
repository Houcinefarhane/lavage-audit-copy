export type CheckpointStatus = 'OUI' | 'NON' | null;

export interface Checkpoint {
  id: string;
  label: string;
  status: CheckpointStatus;
  photos?: string[];
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

// Types pour le module Finance/CA
export interface FinancialTransaction {
  id: string;
  siteId: string;
  date: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export interface FinancialSummary {
  siteId: string;
  period: string; // 'day' | 'week' | 'month' | 'year'
  revenue: number;
  expenses: number;
  profit: number;
}

// Types pour le module Équipements
export type EquipmentStatus = 'operational' | 'maintenance' | 'broken' | 'warning';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Equipment {
  id: string;
  siteId: string;
  name: string;
  type: string; // 'terminal' | 'machine' | 'pompe' | 'aspirateur' | 'other'
  status: EquipmentStatus;
  lastMaintenance?: string;
  nextMaintenance?: string;
  serialNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface EquipmentAlert {
  id: string;
  equipmentId: string;
  siteId: string;
  severity: AlertSeverity;
  message: string;
  type: 'maintenance_due' | 'breakdown' | 'warning' | 'other';
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

// Types pour le module Paiements
export interface PaymentTransaction {
  id: string;
  siteId: string;
  terminalId: string;
  date: string;
  amount: number;
  paymentMethod: 'card' | 'cash' | 'mobile' | 'other';
  serviceType: string; // Type de lavage
  transactionId?: string;
  createdAt: string;
}

export interface Terminal {
  id: string;
  siteId: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastSync?: string;
  createdAt: string;
}

// Types pour le module RH
export interface Employee {
  id: string;
  siteId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string; // 'manager' | 'operator' | 'technician' | 'other'
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  salary?: number;
  notes?: string;
  createdAt: string;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  siteId: string;
  date: string;
  startTime: string;
  endTime?: string;
  hours?: number;
  notes?: string;
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

