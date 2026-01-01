import { Audit } from '../types';
import apiRequest from './api';

const STORAGE_KEY = 'audits-qualite';

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
const saveToLocalStorage = (audit: Audit): void => {
  if (!useLocalStorage()) return;
  const audits = getFromLocalStorage();
  audits.push(audit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
};

const getFromLocalStorage = (): Audit[] => {
  if (!useLocalStorage()) return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const deleteFromLocalStorage = (id: string): void => {
  if (!useLocalStorage()) return;
  const audits = getFromLocalStorage().filter(audit => audit.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
};

// Fonctions API avec fallback localStorage
export const saveAudit = async (audit: Audit): Promise<void> => {
  try {
    await apiRequest('/audits', {
      method: 'POST',
      body: JSON.stringify(audit),
    });
    // Synchroniser avec localStorage en cas de succès
    saveToLocalStorage(audit);
  } catch (error) {
    console.warn('API non disponible ou erreur serveur, utilisation du localStorage uniquement:', error);
    saveToLocalStorage(audit);
    // On ne relance pas l'erreur pour que l'interface reste utilisable
  }
};

export const getAudits = async (siteId?: string): Promise<Audit[]> => {
  // Toujours lire le localStorage, pour afficher aussi les audits
  // qui auraient été sauvegardés en fallback (si l'API a échoué).
  const localAudits = getFromLocalStorage();

  try {
    const endpoint = siteId && siteId !== 'all' ? `/audits?siteId=${siteId}` : '/audits';
    const apiAudits = await apiRequest<Audit[]>(endpoint);

    // Fusionner API + localStorage (priorité à l'API en cas de doublon d'id)
    const mergedMap = new Map<string, Audit>();
    for (const audit of apiAudits) {
      mergedMap.set(audit.id, audit);
    }
    for (const audit of localAudits) {
      if (!mergedMap.has(audit.id)) {
        mergedMap.set(audit.id, audit);
      }
    }

    let result = Array.from(mergedMap.values());
    if (siteId && siteId !== 'all') {
      result = result.filter(audit => audit.siteId === siteId);
    }
    return result;
  } catch (error) {
    console.warn('API non disponible, utilisation du localStorage uniquement:', error);
    if (siteId && siteId !== 'all') {
      return localAudits.filter(audit => audit.siteId === siteId);
    }
    return localAudits;
  }
};

export const deleteAudit = async (id: string): Promise<void> => {
  try {
    await apiRequest(`/audits/${id}`, {
      method: 'DELETE',
    });
    deleteFromLocalStorage(id);
  } catch (error) {
    console.warn('API non disponible, utilisation du localStorage:', error);
    deleteFromLocalStorage(id);
    throw error;
  }
};

export const clearAllAudits = (): void => {
  if (useLocalStorage()) {
    localStorage.removeItem(STORAGE_KEY);
  }
};

