// Configuration de l'API
// En production sur Netlify, utilisez l'URL relative
// En développement local, utilisez localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3015/api');

// Fonction utilitaire pour les requêtes API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      const message =
        errorBody.details ||
        errorBody.error ||
        `Erreur HTTP: ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export default apiRequest;

