export interface Site {
  id: string;
  name: string;
  city: string;
}

// Réexporter les fonctions du storage pour compatibilité
export { getSites, getSiteById, getSiteName, addSite, updateSite, deleteSite } from './siteStorage';

