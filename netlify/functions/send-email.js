// Netlify Function pour envoyer des emails
// Nécessite une clé API d'un service d'email (Resend, SendGrid, etc.)

export const handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  }

  try {
    console.log('Requête reçue:', event.httpMethod, event.path);
    const body = JSON.parse(event.body);
    const { auditId, auditIds, to, siteName, siteNames, type, auditData } = body;

    console.log('Données reçues:', { auditId, to, siteName, hasAuditData: !!auditData });

    // Vérifier que l'email est fourni
    if (!to || !to.includes('@')) {
      console.error('Email invalide:', to);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Adresse email invalide' }),
      };
    }

    // Récupérer les données de l'audit depuis le store mémoire (ou base de données)
    // Pour Netlify Functions, on utilise le store partagé de l'API
    let audit = null;
    if (auditId && auditData) {
      // Les données de l'audit sont envoyées depuis le frontend
      audit = auditData;
    } else if (auditId) {
      // Essayer de récupérer depuis l'API (nécessite un accès partagé au store)
      // Pour l'instant, on utilise les données envoyées
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Données de l\'audit manquantes' }),
      };
    }

    // Option 1 : Utiliser Resend (Recommandé - gratuit jusqu'à 3000 emails/mois)
    // Créez un compte sur https://resend.com et ajoutez votre clé API dans les variables d'environnement Netlify
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    console.log('RESEND_API_KEY configuré:', !!RESEND_API_KEY);
    
    if (RESEND_API_KEY) {
      // Générer le contenu HTML de l'email
      const emailSubject = type === 'multiple' 
        ? `Rapport d'Audits Qualité - ${auditIds.length} audit(s)`
        : `Rapport d'Audit Qualité - ${siteName || 'Site'}`;
      
      console.log('Génération HTML email...');
      const emailHtml = type === 'multiple'
        ? generateMultipleAuditsEmailHtml(auditIds, siteNames, body.auditsData)
        : generateSingleAuditEmailHtml(audit, siteName);

      // Envoyer via Resend
      // Utiliser le domaine vérifié si disponible, sinon utiliser l'adresse de test Resend
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Audit Qualité <onboarding@resend.dev>';
      
      console.log('Envoi via Resend à:', to, 'depuis:', fromEmail);
      
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      const resendData = await resendResponse.json();
      console.log('Réponse Resend:', resendResponse.status, resendData);

      if (!resendResponse.ok) {
        console.error('Erreur Resend:', resendData);
        throw new Error(resendData.message || resendData.error?.message || 'Erreur lors de l\'envoi via Resend');
      }

      console.log('Email envoyé avec succès via Resend');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Email envoyé avec succès',
          resendId: resendData.id
        }),
      };
    }

    // Option 2 : Utiliser SendGrid (Alternative)
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    
    if (SENDGRID_API_KEY) {
      const emailSubject = type === 'multiple' 
        ? `Rapport d'Audits Qualité - ${auditIds.length} audit(s)`
        : `Rapport d'Audit Qualité - ${siteName}`;
      
      const emailHtml = type === 'multiple'
        ? generateMultipleAuditsEmailHtml(auditIds, siteNames)
        : generateSingleAuditEmailHtml(auditId, siteName);

      const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
          }],
          from: { email: 'noreply@votre-domaine.com' }, // Remplacez par votre email vérifié
          subject: emailSubject,
          content: [{
            type: 'text/html',
            value: emailHtml,
          }],
        }),
      });

      if (!sendgridResponse.ok) {
        const error = await sendgridResponse.text();
        throw new Error(error || 'Erreur lors de l\'envoi via SendGrid');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Email envoyé avec succès' 
        }),
      };
    }

    // Si aucun service d'email n'est configuré
    console.error('Aucun service d\'email configuré');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Service d\'email non configuré. Veuillez configurer RESEND_API_KEY dans les variables d\'environnement Netlify. Consultez EMAIL_SETUP.md pour plus d\'informations.' 
      }),
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Erreur lors de l\'envoi de l\'email' 
      }),
    };
  }
};

// Générer le HTML du plan d'action
function generateActionPlanHtml(audit) {
  const anomalies = audit.checkpoints ? audit.checkpoints.filter(cp => cp.status === 'NON') : [];
  
  if (anomalies.length === 0) {
    return '';
  }

  const actionPlan = {
    'accueil-souriant': [
      'Former le personnel à l\'accueil client',
      'Mettre en place un rappel visuel (affiche)',
      'Organiser une session de sensibilisation'
    ],
    'epi-chaussures': [
      'Vérifier la disponibilité des EPI',
      'Rappeler l\'obligation du port des EPI',
      'Contrôler régulièrement le respect des consignes'
    ],
    'zone-lavage-propre': [
      'Nettoyer immédiatement la zone',
      'Mettre en place un planning de nettoyage',
      'Vérifier le bon fonctionnement du système d\'évacuation'
    ],
    'plv-propres': [
      'Nettoyer les supports PLV',
      'Remplacer les PLV abîmées',
      'Mettre à jour les informations affichées'
    ],
    'machine-ok': [
      'Effectuer la maintenance préventive',
      'Vérifier les pièces d\'usure',
      'Contacter le service technique si nécessaire'
    ],
    'tornador-brosse-ok': [
      'Vérifier l\'état des équipements',
      'Nettoyer et entretenir les outils',
      'Remplacer les pièces défectueuses'
    ],
    'produits-references': [
      'Vérifier le stock des produits référencés',
      'Commander les produits manquants',
      'Mettre à jour l\'inventaire'
    ],
    'pulverisateurs-ok': [
      'Vérifier le bon fonctionnement',
      'Nettoyer les buses et filtres',
      'Remplacer si nécessaire'
    ],
    'barrieres-ok': [
      'Vérifier l\'état des barrières',
      'Réparer ou remplacer les éléments défectueux',
      'S\'assurer de la conformité sécurité'
    ],
    'meuble-accueil-ok': [
      'Nettoyer et ranger le meuble',
      'Vérifier l\'organisation des documents',
      'Remettre en ordre si nécessaire'
    ],
    'tenue-wash-ok': [
      'Vérifier la disponibilité des tenues',
      'Rappeler le port de la tenue réglementaire',
      'Contrôler la propreté des tenues'
    ],
    'feedback-now-ok': [
      'Vérifier le fonctionnement du système',
      'Former le personnel à son utilisation',
      'Tester la remontée des données'
    ],
    'materiel-range': [
      'Ranger immédiatement le matériel',
      'Mettre en place des zones de rangement claires',
      'Établir une procédure de rangement'
    ],
    'trousse-secours': [
      'Vérifier le contenu de la trousse',
      'Remplacer les éléments périmés',
      'S\'assurer de l\'accessibilité'
    ],
    'local-technique-ok': [
      'Nettoyer le local technique',
      'Vérifier l\'organisation et le rangement',
      'Contrôler la sécurité électrique'
    ],
    'rack-ok': [
      'Vérifier l\'état des racks',
      'Nettoyer et entretenir',
      'Remplacer si nécessaire'
    ],
    'accueil-tablette': [
      'Vérifier le fonctionnement de la tablette',
      'Mettre à jour les applications',
      'Former le personnel à son utilisation'
    ]
  };

  const anomaliesHtml = anomalies.map((anomaly, index) => {
    const actions = actionPlan[anomaly.id] || [
      'Analyser la cause de l\'anomalie',
      'Mettre en place des mesures correctives',
      'Suivre l\'efficacité des actions'
    ];

    const actionsList = actions.map(action => `
      <li style="margin: 5px 0; padding-left: 5px;">
        <input type="checkbox" style="margin-right: 8px;"> ${action}
      </li>
    `).join('');

    return `
      <div style="background: #FFF5E1; border-left: 4px solid #ED8936; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #C05621;">
          ${index + 1}. ${anomaly.label}
        </h4>
        <ul style="margin: 0; padding-left: 20px; color: #2D3748;">
          ${actionsList}
        </ul>
      </div>
    `;
  }).join('');

  return `
    <div style="margin-top: 30px; padding: 20px; background: #FFF5E1; border-radius: 8px; border: 2px solid #ED8936;">
      <h3 style="margin: 0 0 15px 0; color: #C05621; font-size: 18px;">
        📋 Plan d'Action - Anomalies Constatées
      </h3>
      ${anomaliesHtml}
      <p style="margin: 15px 0 0 0; padding: 10px; background: white; border-radius: 4px; font-size: 12px; color: #718096; font-style: italic;">
        <strong>Note :</strong> Cocher les actions réalisées et suivre leur efficacité lors du prochain audit.
      </p>
      <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 4px; font-size: 12px;">
        <p style="margin: 5px 0;"><strong>Date de suivi prévue :</strong> ___________________</p>
        <p style="margin: 5px 0;"><strong>Responsable :</strong> ___________________________</p>
      </div>
    </div>
  `;
}

// Générer le HTML pour un seul audit
function generateSingleAuditEmailHtml(audit, siteName) {
  if (!audit) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <p>Erreur : Données de l'audit non disponibles.</p>
      </body>
      </html>
    `;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ouiCount = audit.checkpoints ? audit.checkpoints.filter(cp => cp.status === 'OUI').length : 0;
  const nonCount = audit.checkpoints ? audit.checkpoints.filter(cp => cp.status === 'NON').length : 0;
  const scoreColor = audit.score >= 80 ? '#48BB78' : audit.score >= 60 ? '#ED8936' : '#F56565';
  
  const checkpointsHtml = audit.checkpoints ? audit.checkpoints.map((cp, index) => {
    const statusIcon = cp.status === 'OUI' ? '✓' : cp.status === 'NON' ? '✗' : '?';
    const statusColor = cp.status === 'OUI' ? '#48BB78' : cp.status === 'NON' ? '#F56565' : '#718096';
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${index + 1}. ${cp.label}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center; color: ${statusColor}; font-weight: bold;">${statusIcon} ${cp.status || 'Non renseigné'}</td>
      </tr>
    `;
  }).join('') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #4299E1; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #f7fafc; }
        .info-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .score-box { background: ${scoreColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-item { flex: 1; text-align: center; padding: 15px; background: white; border-radius: 8px; }
        .stat-value { font-size: 28px; font-weight: bold; }
        .stat-label { font-size: 12px; color: #718096; margin-top: 5px; }
        .oui { color: #48BB78; }
        .non { color: #F56565; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; }
        th { background: #4299E1; color: white; padding: 12px; text-align: left; }
        td { padding: 10px 12px; }
        .comment-box { background: #FFF5E1; border-left: 4px solid #ED8936; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; background: #EDF2F7; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Rapport d'Audit Qualité</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Vous trouverez ci-dessous le rapport d'audit qualité pour le site <strong>${siteName || 'Non spécifié'}</strong>.</p>
          
          <div class="info-box">
            <h2 style="margin-top: 0; color: #2D3748;">Informations Générales</h2>
            <p><strong>Date de l'audit :</strong> ${formatDate(audit.date)}</p>
            <p><strong>Site :</strong> ${siteName || 'Non spécifié'}</p>
          </div>

          <div class="score-box">
            Score Global : ${audit.score}%
          </div>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-value oui">${ouiCount}</div>
              <div class="stat-label">Points Conformes (OUI)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value non">${nonCount}</div>
              <div class="stat-label">Points Non Conformes (NON)</div>
            </div>
          </div>

          ${audit.comment ? `
          <div class="comment-box">
            <strong>Commentaires :</strong>
            <p style="margin: 10px 0 0 0;">${audit.comment}</p>
          </div>
          ` : ''}

          <h3 style="color: #2D3748; margin-top: 30px;">Détails des Points de Contrôle</h3>
          <table>
            <thead>
              <tr>
                <th>Point de Contrôle</th>
                <th style="text-align: center;">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${checkpointsHtml}
            </tbody>
          </table>

          ${generateActionPlanHtml(audit)}

          <p style="margin-top: 30px; padding: 15px; background: #E6FFFA; border-radius: 8px; border-left: 4px solid #48BB78;">
            <strong>💡 Note :</strong> Pour télécharger le PDF complet avec tous les détails, veuillez utiliser l'application.
          </p>
        </div>
        <div class="footer">
          <p>Ceci est un email automatique généré par le système d'audit qualité.</p>
          <p>Merci de ne pas répondre à cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Générer le HTML pour plusieurs audits
function generateMultipleAuditsEmailHtml(auditIds, siteNames, auditsData) {
  if (!auditsData || !Array.isArray(auditsData)) {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Erreur : Données des audits non disponibles.</p>
      </body>
      </html>
    `;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const auditsHtml = auditsData.map((audit, index) => {
    const siteName = siteNames[audit.siteId] || 'Site inconnu';
    const scoreColor = audit.score >= 80 ? '#48BB78' : audit.score >= 60 ? '#ED8936' : '#F56565';
    const ouiCount = audit.checkpoints ? audit.checkpoints.filter(cp => cp.status === 'OUI').length : 0;
    const nonCount = audit.checkpoints ? audit.checkpoints.filter(cp => cp.status === 'NON').length : 0;

    return `
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #2D3748;">Audit #${index + 1}</h3>
        <p><strong>Date :</strong> ${formatDate(audit.date)}</p>
        <p><strong>Site :</strong> ${siteName}</p>
        <div style="background: ${scoreColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0; font-size: 20px; font-weight: bold;">
          Score : ${audit.score}%
        </div>
        <div style="display: flex; gap: 20px; margin: 15px 0;">
          <div style="flex: 1; text-align: center; padding: 10px; background: #F0FDF4; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #48BB78;">${ouiCount}</div>
            <div style="font-size: 12px; color: #718096;">OUI</div>
          </div>
          <div style="flex: 1; text-align: center; padding: 10px; background: #FEF2F2; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #F56565;">${nonCount}</div>
            <div style="font-size: 12px; color: #718096;">NON</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #4299E1; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #f7fafc; }
        .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; background: #EDF2F7; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Rapport d'Audits Qualité</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Vous trouverez ci-dessous le rapport de <strong>${auditsData.length} audit(s)</strong> qualité.</p>
          ${auditsHtml}
          <p style="margin-top: 30px; padding: 15px; background: #E6FFFA; border-radius: 8px; border-left: 4px solid #48BB78;">
            <strong>💡 Note :</strong> Pour télécharger les PDFs complets avec tous les détails, veuillez utiliser l'application.
          </p>
        </div>
        <div class="footer">
          <p>Ceci est un email automatique généré par le système d'audit qualité.</p>
          <p>Merci de ne pas répondre à cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

