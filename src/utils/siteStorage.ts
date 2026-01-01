import { Site } from './sites';
import apiRequest from './api';

const STORAGE_KEY = 'sites-list';

// Fallback vers localStorage si l'API n'est pas disponible
const useLocalStorage = () => {
  try {
    localStorage.getItem('test');
    localStorage.removeItem('test');
    return true;
  } catch {
    return false;
  }
};

// Sauvegarder dans localStorage en fallback
const saveSitesToLocalStorage = (sites: Site[]): void => {
  if (!useLocalStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
};

const getSitesFromLocalStorage = (): Site[] => {
  if (!useLocalStorage()) return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Initialiser avec les sites par défaut si aucun site n'est stocké (localStorage uniquement)
const initializeSitesLocal = (): void => {
  if (!useLocalStorage()) return;
  const existingSites = localStorage.getItem(STORAGE_KEY);
  if (!existingSites) {
    // Les sites par défaut sont maintenant gérés par le backend
    // On ne les initialise plus ici
  }
};

// Fonctions API avec fallback localStorage
export const getSites = async (): Promise<Site[]> => {
  try {
    const sites = await apiRequest<Site[]>('/sites');
    // Synchroniser avec localStorage
    if (useLocalStorage()) {
      saveSitesToLocalStorage(sites);
    }
    return sites;
  } catch (error) {
    console.warn('API non disponible, utilisation du localStorage:', error);
    initializeSitesLocal();
    return getSitesFromLocalStorage();
  }
};

export const getSiteById = async (id: string): Promise<Site | undefined> => {
  try {
    const site = await apiRequest<Site>(`/sites/${id}`);
    return site;
  } catch (error) {
    console.warn('API non disponible, utilisation du localStorage:', error);
    const sites = getSitesFromLocalStorage();
    return sites.find(site => site.id === id);
  }
};

export const getSiteName = async (id: string): Promise<string> => {
  try {
    const site = await getSiteById(id);
    return site ? site.name : 'Site inconnu';
  } catch {
    const sites = getSitesFromLocalStorage();
    const site = sites.find(s => s.id === id);
    return site ? site.name : 'Site inconnu';
  }
};

export const addSite = async (newSite: Omit<Site, 'id'>): Promise<Site> => {
  try {
    const site = await apiRequest<Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(newSite),
    });
    // Synchroniser avec localStorage
    const sites = getSitesFromLocalStorage();
    sites.push(site);
    saveSitesToLocalStorage(sites);
    return site;
  } catch (error) {
    console.warn('API non disponible, utilisation du localStorage:', error);
    const sites = getSitesFromLocalStorage();
    const siteWithId: Site = { ...newSite, id: `site-${Date.now()}` };
    sites.push(siteWithId);
    saveSitesToLocalStorage(sites);
    return siteWithId;
  }
};

export const updateSite = async (id: string, updatedFields: Omit<Site, 'id'>): Promise<void> => {
  try {
    await apiRequest(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    // Synchroniser avec localStorage
    const sites = getSitesFromLocalStorage();
    const index = sites.findIndex(s => s.id === id);
    if (index !== -1) {
      sites[index] = { ...sites[index], ...updatedFields };
      saveSitesToLocalStorage(sites);
    }
  } catch (error) {
    console.warn('API non disponible, utilisation du localStorage:', error);
    const sites = getSitesFromLocalStorage();
    const index = sites.findIndex(s => s.id === id);
    if (index !== -1) {
      sites[index] = { ...sites[index], ...updatedFields };
      saveSitesToLocalStorage(sites);
    }
    throw error;
  }
};

export const deleteSite = async (id: string): Promise<void> => {
  try {
    await apiRequest(`/sites/${id}`, {
      method: 'DELETE',
    });
    // Synchroniser avec localStorage
    const sites = getSitesFromLocalStorage().filter(site => site.id !== id);
    saveSitesToLocalStorage(sites);
  } catch (error: any) {
    // Si l'erreur vient du serveur (site a des audits), on la propage
    if (error.message && error.message.includes('audits')) {
      throw error;
    }
    console.warn('API non disponible, utilisation du localStorage:', error);
    const sites = getSitesFromLocalStorage().filter(site => site.id !== id);
    saveSitesToLocalStorage(sites);
  }
};

// Fonction d'initialisation (maintenant gérée par le backend)
export const initializeSites = (): void => {
  // Plus besoin d'initialiser, le backend le fait
  initializeSitesLocal();
};

