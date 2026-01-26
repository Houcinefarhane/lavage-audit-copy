export interface Site {
  id: string;
  name: string;
  city: string;
  address?: string;
  franchiseName?: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  openingDate?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

// Réexporter les fonctions du storage pour compatibilité
export { getSites, getSiteById, getSiteName, addSite, updateSite, deleteSite } from './siteStorage';

