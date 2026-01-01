// Service pour envoyer des emails via l'API backend

export const sendAuditEmail = async (
  auditId: string,
  to: string,
  siteName: string,
  auditData?: any
): Promise<void> => {
  try {
    // Utiliser l'URL relative en production, localhost en dev
    const apiUrl = import.meta.env.PROD ? '/api/send-email' : 'http://localhost:3015/api/send-email';
    
    console.log('Envoi requête email à:', apiUrl);
    console.log('Données envoyées:', { auditId, to, siteName, hasAuditData: !!auditData });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auditId,
        to,
        siteName,
        auditData, // Envoyer les données complètes de l'audit
      }),
    });

    console.log('Statut réponse:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(async () => {
        const text = await response.text();
        return { error: text || 'Erreur inconnue' };
      });
      console.error('Erreur réponse serveur:', errorData);
      throw new Error(errorData.error || `Erreur HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Email envoyé avec succès:', result);
    return result;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Erreur de connexion. Vérifiez votre connexion internet et que le serveur est accessible.');
  }
};

export const sendMultipleAuditsEmail = async (
  auditIds: string[],
  to: string,
  siteNames: Record<string, string>
): Promise<void> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auditIds,
        to,
        siteNames,
        type: 'multiple',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(error.error || 'Erreur lors de l\'envoi de l\'email');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

