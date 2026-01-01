import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as db from './db.js';

// Charger les variables d'environnement depuis .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3015;

// Middleware
// Configuration CORS pour la production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // En production, spécifiez votre URL frontend
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialiser les sites par défaut (uniquement pour SQLite)
// Note: Cette fonction est async, mais on ne peut pas utiliser await au niveau top-level
// On l'appellera dans une fonction async plus tard si nécessaire
db.initializeDefaultSites().catch(err => {
  console.error('Erreur lors de l\'initialisation des sites:', err);
});

// ===== ROUTES AUTHENTIFICATION =====

// POST /api/auth/login - Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Vérifier l'email autorisé
    const allowedEmail = 'mohamed.farhane@wash.totalenergies.com';
    if (email !== allowedEmail) {
      return res.status(401).json({ error: 'Email non autorisé' });
    }

    // Récupérer le hash du mot de passe depuis les variables d'environnement
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!passwordHash) {
      return res.status(500).json({ 
        error: 'Configuration manquante. Veuillez configurer ADMIN_PASSWORD_HASH dans le fichier .env' 
      });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Générer un token simple (en production, utilisez JWT)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    res.json({
      success: true,
      token,
      email,
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET /api/auth/verify - Vérifier le token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.substring(7);
    // Vérification simple (en production, utilisez JWT)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    
    if (decoded.includes('mohamed.farhane@wash.totalenergies.com')) {
      res.json({ valid: true, email: 'mohamed.farhane@wash.totalenergies.com' });
    } else {
      res.status(401).json({ valid: false });
    }
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// ===== ROUTES AUDITS =====

// GET /api/audits - Récupérer tous les audits
app.get('/api/audits', async (req, res) => {
  try {
    const { siteId } = req.query;
    const audits = await db.getAudits(siteId || null);
    res.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des audits' });
  }
});

// POST /api/audits - Créer un nouvel audit
app.post('/api/audits', async (req, res) => {
  try {
    const { id, date, siteId, score, totalCheckpoints, comment, checkpoints } = req.body;

    if (!id || !date || !siteId || score === undefined || !checkpoints) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    await db.createAudit({ id, date, siteId, score, totalCheckpoints, comment, checkpoints });
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creating audit:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'audit',
      details: error.message || error,
    });
  }
});

// DELETE /api/audits/:id - Supprimer un audit
app.delete('/api/audits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAudit(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting audit:', error);
    if (error.message === 'Audit non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'audit' });
  }
});

// ===== ROUTES SITES =====

// GET /api/sites - Récupérer tous les sites
app.get('/api/sites', async (req, res) => {
  try {
    const sites = await db.getSites();
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sites' });
  }
});

// GET /api/sites/:id - Récupérer un site par ID
app.get('/api/sites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const site = await db.getSite(id);

    if (!site) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du site' });
  }
});

// POST /api/sites - Créer un nouveau site
app.post('/api/sites', async (req, res) => {
  try {
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'Nom et ville requis' });
    }

    const site = await db.createSite({ name, city });
    res.status(201).json(site);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Erreur lors de la création du site' });
  }
});

// PUT /api/sites/:id - Mettre à jour un site
app.put('/api/sites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'Nom et ville requis' });
    }

    const site = await db.updateSite(id, { name, city });
    res.json(site);
  } catch (error) {
    console.error('Error updating site:', error);
    if (error.message === 'Site non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du site' });
  }
});

// DELETE /api/sites/:id - Supprimer un site
app.delete('/api/sites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteSite(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    if (error.message === 'Site non trouvé' || error.message.includes('Impossible de supprimer')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression du site' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route pour l'envoi d'emails (pour développement local et production)
app.post('/api/send-email', async (req, res) => {
  try {
    console.log('📧 Requête d\'envoi d\'email reçue');
    const { auditId, to, siteName, auditData } = req.body;

    console.log('Données reçues:', { auditId, to, siteName, hasAuditData: !!auditData });

    if (!to || !to.includes('@')) {
      console.error('Email invalide:', to);
      return res.status(400).json({ error: 'Adresse email invalide' });
    }

    if (!auditData) {
      console.error('Données audit manquantes');
      return res.status(400).json({ error: 'Données de l\'audit manquantes' });
    }

    // Générer le HTML de l'email
    const emailHtml = generateSingleAuditEmailHtml(auditData, siteName);
    const emailSubject = `Rapport d'Audit Qualité - ${siteName || 'Site'}`;

    // Essayer Brevo d'abord (service français, 300 emails/jour gratuit, pas besoin de domaine)
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (BREVO_API_KEY) {
      console.log('✅ BREVO_API_KEY trouvée, envoi via Brevo...');
      const fromEmail = process.env.BREVO_FROM_EMAIL || 'houcinefarhane138@gmail.com';
      const fromName = process.env.BREVO_FROM_NAME || 'Audit Qualité';
      
      console.log('Envoi via Brevo à:', to, 'depuis:', fromEmail);

      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: fromName },
          to: [{ email: to }],
          subject: emailSubject,
          htmlContent: emailHtml,
        }),
      });

      if (brevoResponse.ok) {
        const brevoData = await brevoResponse.json();
        console.log('✅ Email envoyé avec succès via Brevo, ID:', brevoData.messageId);
        return res.json({ 
          success: true, 
          message: 'Email envoyé avec succès',
          provider: 'Brevo',
          messageId: brevoData.messageId
        });
      } else {
        const brevoError = await brevoResponse.text();
        console.error('Erreur Brevo:', brevoError);
        // Continuer pour essayer SendGrid si disponible
      }
    }

    // Essayer SendGrid si Brevo n'est pas configuré
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (SENDGRID_API_KEY) {
      console.log('✅ SENDGRID_API_KEY trouvée, envoi via SendGrid...');
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'houcinefarhane138@gmail.com';
      
      console.log('Envoi via SendGrid à:', to, 'depuis:', fromEmail);

      const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject: emailSubject,
          }],
          from: { email: fromEmail, name: 'Audit Qualité' },
          content: [{
            type: 'text/html',
            value: emailHtml,
          }],
        }),
      });

      if (sendgridResponse.ok) {
        console.log('✅ Email envoyé avec succès via SendGrid');
        return res.json({ 
          success: true, 
          message: 'Email envoyé avec succès',
          provider: 'SendGrid'
        });
      } else {
        const sendgridError = await sendgridResponse.text();
        console.error('Erreur SendGrid:', sendgridError);
        // Continuer pour essayer Resend si disponible
      }
    }

    // Essayer Resend si SendGrid n'est pas configuré ou a échoué
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      console.log('✅ RESEND_API_KEY trouvée, envoi via Resend...');
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
        return res.status(500).json({ 
          error: resendData.message || resendData.error?.message || 'Erreur lors de l\'envoi via Resend' 
        });
      }

      console.log('✅ Email envoyé avec succès via Resend');
      return res.json({ 
        success: true, 
        message: 'Email envoyé avec succès',
        resendId: resendData.id,
        provider: 'Resend'
      });
    }

    // Si aucun service d'email n'est configuré, mode simulation
    console.log('⚠️ Aucune clé API email configurée, mode simulation');
    console.log('📧 Email à envoyer (simulation):');
    console.log('  À:', to);
    console.log('  Site:', siteName);
    console.log('  Audit ID:', auditId);
    console.log('  Score:', auditData.score);
    console.log('\n💡 Pour envoyer de vrais emails, configurez une de ces options:');
    console.log('   - Option 1 (Recommandé): BREVO_API_KEY (service français, 300 emails/jour gratuit)');
    console.log('   - Option 2: SENDGRID_API_KEY (permet Gmail sans domaine)');
    console.log('   - Option 3: RESEND_API_KEY (nécessite un domaine vérifié)');

    res.json({ 
      success: true, 
      message: 'Email simulé (configurez RESEND_API_KEY pour envoyer de vrais emails)',
      simulated: true
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'envoi de l\'email' 
    });
  }
});

// Fonction pour générer le HTML de l'email (copiée de netlify/functions/send-email.js)
function generateSingleAuditEmailHtml(audit, siteName) {
  if (!audit) {
    return '<p>Erreur : Données de l\'audit non disponibles.</p>';
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

  const anomalies = audit.checkpoints ? audit.checkpoints.filter(cp => cp.status === 'NON') : [];
  const actionPlanHtml = generateActionPlanHtml(audit, anomalies);

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

          ${actionPlanHtml}

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

function generateActionPlanHtml(audit, anomalies) {
  if (!anomalies || anomalies.length === 0) {
    return '';
  }

  const actionPlan = {
    'accueil-souriant': ['Former le personnel à l\'accueil client', 'Mettre en place un rappel visuel (affiche)', 'Organiser une session de sensibilisation'],
    'epi-chaussures': ['Vérifier la disponibilité des EPI', 'Rappeler l\'obligation du port des EPI', 'Contrôler régulièrement le respect des consignes'],
    'zone-lavage-propre': ['Nettoyer immédiatement la zone', 'Mettre en place un planning de nettoyage', 'Vérifier le bon fonctionnement du système d\'évacuation'],
    'plv-propres': ['Nettoyer les supports PLV', 'Remplacer les PLV abîmées', 'Mettre à jour les informations affichées'],
    'machine-ok': ['Effectuer la maintenance préventive', 'Vérifier les pièces d\'usure', 'Contacter le service technique si nécessaire'],
    'tornador-brosse-ok': ['Vérifier l\'état des équipements', 'Nettoyer et entretenir les outils', 'Remplacer les pièces défectueuses'],
    'produits-references': ['Vérifier le stock des produits référencés', 'Commander les produits manquants', 'Mettre à jour l\'inventaire'],
    'pulverisateurs-ok': ['Vérifier le bon fonctionnement', 'Nettoyer les buses et filtres', 'Remplacer si nécessaire'],
    'barrieres-ok': ['Vérifier l\'état des barrières', 'Réparer ou remplacer les éléments défectueux', 'S\'assurer de la conformité sécurité'],
    'meuble-accueil-ok': ['Nettoyer et ranger le meuble', 'Vérifier l\'organisation des documents', 'Remettre en ordre si nécessaire'],
    'tenue-wash-ok': ['Vérifier la disponibilité des tenues', 'Rappeler le port de la tenue réglementaire', 'Contrôler la propreté des tenues'],
    'feedback-now-ok': ['Vérifier le fonctionnement du système', 'Former le personnel à son utilisation', 'Tester la remontée des données'],
    'materiel-range': ['Ranger immédiatement le matériel', 'Mettre en place des zones de rangement claires', 'Établir une procédure de rangement'],
    'trousse-secours': ['Vérifier le contenu de la trousse', 'Remplacer les éléments périmés', 'S\'assurer de l\'accessibilité'],
    'local-technique-ok': ['Nettoyer le local technique', 'Vérifier l\'organisation et le rangement', 'Contrôler la sécurité électrique'],
    'rack-ok': ['Vérifier l\'état des racks', 'Nettoyer et entretenir', 'Remplacer si nécessaire'],
    'accueil-tablette': ['Vérifier le fonctionnement de la tablette', 'Mettre à jour les applications', 'Former le personnel à son utilisation']
  };

  const anomaliesHtml = anomalies.map((anomaly, index) => {
    const actions = actionPlan[anomaly.id] || ['Analyser la cause de l\'anomalie', 'Mettre en place des mesures correctives', 'Suivre l\'efficacité des actions'];
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

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
