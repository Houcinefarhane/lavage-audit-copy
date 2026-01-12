import jsPDF from 'jspdf';
import { Audit } from '../types';

interface GeneratePDFOptions {
  audit: Audit;
  siteName: string;
}

// Fonction pour charger une image depuis une URL et la convertir en base64
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Impossible de charger l'image: ${url}`);
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Erreur lors du chargement de l'image ${url}:`, error);
    return null;
  }
};

export const generateAuditPDF = async ({ audit, siteName }: GeneratePDFOptions): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Réduit de 20 à 15
  let yPosition = margin;

  // Couleurs
  const primaryColor = [59, 130, 246]; // Bleu
  const successColor = [16, 185, 129]; // Vert
  const dangerColor = [239, 68, 68]; // Rouge
  const warningColor = [245, 158, 11]; // Orange

  // En-tête compact avec symboles
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 28, 'F'); // Réduit de 40 à 28
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); // Réduit de 20 à 16
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport d\'Audit Qualite', pageWidth / 2, 12, { align: 'center' });
  
  doc.setFontSize(10); // Réduit de 12 à 10
  doc.setFont('helvetica', 'normal');
  doc.text('Centre de Lavage Automobile', pageWidth / 2, 20, { align: 'center' });

  yPosition = 35; // Réduit de 50 à 35

  // Informations générales - Layout compact en deux colonnes
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11); // Réduit de 14 à 11
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Generales', margin, yPosition);
  yPosition += 6; // Réduit de 10 à 6

  doc.setFontSize(9); // Réduit de 10 à 9
  doc.setFont('helvetica', 'normal');
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Layout en deux colonnes pour optimiser l'espace
  const col1X = margin;
  const col2X = pageWidth / 2 + 5;
  
  doc.text(`Date : ${formatDate(audit.date)}`, col1X, yPosition);
  doc.text(`Site : ${siteName}`, col2X, yPosition);
  yPosition += 6; // Réduit de 7 à 6
  
  // Score avec couleur - compact
  const scoreColor = audit.score >= 80 ? successColor : audit.score >= 60 ? warningColor : dangerColor;
  const ouiCount = audit.checkpoints.filter(cp => cp.status === 'OUI').length;
  const nonCount = audit.checkpoints.filter(cp => cp.status === 'NON').length;
  
  // Symbole selon le score
  const scoreSymbol = audit.score >= 80 ? '[OK]' : audit.score >= 60 ? '[!]' : '[X]';
  
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11); // Réduit de 12 à 11
  const scoreText = `${scoreSymbol} Score : ${audit.score}%`;
  const scoreWidth = doc.getTextWidth(scoreText);
  const scoreHeight = 6; // Réduit de 8 à 6
  const scoreX = col1X;
  const scoreY = yPosition;
  
  // Dessiner le rectangle de fond avec coins arrondis visuels
  doc.rect(scoreX, scoreY - scoreHeight + 1, scoreWidth + 6, scoreHeight, 'F');
  
  // Ajouter le texte par-dessus
  doc.setTextColor(255, 255, 255);
  doc.text(scoreText, scoreX + 3, scoreY);
  
  // Statistiques à côté du score avec symboles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(successColor[0], successColor[1], successColor[2]);
  doc.text(`[OK] OUI: ${ouiCount}`, col2X, yPosition);
  yPosition += 5;
  
  doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
  doc.text(`[X] NON: ${nonCount}`, col2X, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  yPosition += 8; // Espacement réduit

  // Commentaire si présent - compact
  if (audit.comment) {
    doc.setFontSize(10); // Réduit de 12 à 10
    doc.setFont('helvetica', 'bold');
    doc.text('Commentaires', margin, yPosition);
    yPosition += 5; // Réduit de 8 à 5

    doc.setFontSize(8); // Réduit de 10 à 8
    doc.setFont('helvetica', 'normal');
    const commentLines = doc.splitTextToSize(audit.comment, pageWidth - 2 * margin);
    doc.text(commentLines, margin, yPosition);
    yPosition += commentLines.length * 4 + 4; // Réduit l'espacement
  }

  // Détails des points de contrôle - Layout en une seule colonne
  doc.setFontSize(11); // Réduit de 12 à 11
  doc.setFont('helvetica', 'bold');
  doc.text('Points de Controle', margin, yPosition);
  yPosition += 5; // Réduit de 8 à 5

  doc.setFontSize(8); // Réduit de 9 à 8
  doc.setFont('helvetica', 'normal');

  // Une seule colonne pour tous les checkpoints
  const colX = margin;
  let currentY = yPosition;

  // Traiter chaque checkpoint avec support des photos
  for (let index = 0; index < audit.checkpoints.length; index++) {
    const checkpoint = audit.checkpoints[index];
    
    // Vérifier si on dépasse la hauteur disponible
    if (currentY > pageHeight - 50) {
      // Si on dépasse, on ne peut pas continuer
      break;
    }
    
    const status = checkpoint.status;
    // Symboles plus visibles pour les bonnes et mauvaises réponses
    const statusSymbol = status === 'OUI' ? '[OK] OUI' : status === 'NON' ? '[X] NON' : '[?] ?';
    const statusColor = status === 'OUI' ? successColor : status === 'NON' ? dangerColor : [128, 128, 128];

    // Texte du point de contrôle - format compact
    doc.setTextColor(0, 0, 0);
    const labelText = `${index + 1}. ${checkpoint.label}`;
    const maxLabelWidth = pageWidth - 2 * margin - 35; // Plus d'espace pour le texte
    const truncatedLabel = doc.getTextWidth(labelText) > maxLabelWidth 
      ? doc.splitTextToSize(labelText, maxLabelWidth)[0] 
      : labelText;
    doc.text(truncatedLabel, colX, currentY);
    
    // Statut avec symbole et texte aligné à droite - plus visible
    const statusX = pageWidth - margin - 25;
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9); // Légèrement plus grand pour meilleure visibilité
    doc.text(statusSymbol, statusX, currentY);
    
    // Réinitialiser pour le prochain élément
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    currentY += 5; // Espacement entre les checkpoints
    
    // Ajouter les photos si elles existent
    if (checkpoint.photos && checkpoint.photos.length > 0) {
      // Vérifier si on a besoin d'une nouvelle page
      if (currentY + 25 > pageHeight - 20) {
        doc.addPage();
        currentY = margin;
      }
      
      const photoSize = 25; // Taille des miniatures (en mm)
      const photosPerRow = Math.floor((pageWidth - 2 * margin) / (photoSize + 3));
      const startX = colX + 5; // Indentation pour les photos
      let photoX = startX;
      let photoY = currentY;
      
      // Limiter à 3 photos max pour éviter de surcharger le PDF
      const photosToShow = checkpoint.photos.slice(0, 3);
      
      for (let photoIndex = 0; photoIndex < photosToShow.length; photoIndex++) {
        const photoUrl = photosToShow[photoIndex];
        
        // Vérifier si on a besoin d'une nouvelle ligne
        if (photoIndex > 0 && photoIndex % photosPerRow === 0) {
          photoX = startX;
          photoY += photoSize + 3;
          
          // Vérifier si on dépasse la hauteur de page
          if (photoY + photoSize > pageHeight - 20) {
            doc.addPage();
            photoY = margin;
            photoX = startX;
          }
        }
        
        try {
          // Charger l'image et l'ajouter au PDF
          const base64Image = await loadImageAsBase64(photoUrl);
          if (base64Image) {
            // Dessiner un cadre autour de la photo
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.rect(photoX, photoY, photoSize, photoSize, 'S');
            
            // Ajouter l'image
            doc.addImage(base64Image, 'JPEG', photoX, photoY, photoSize, photoSize);
          }
        } catch (error) {
          console.error(`Erreur lors de l'ajout de la photo ${photoUrl}:`, error);
        }
        
        photoX += photoSize + 3;
      }
      
      // Ajuster la position Y pour le prochain checkpoint
      currentY = photoY + photoSize + 5;
      
      // Si on a affiché moins de photos qu'il n'y en a, indiquer qu'il y en a plus
      if (checkpoint.photos.length > 3) {
        doc.setFontSize(7);
        doc.setTextColor(128, 128, 128);
        doc.text(`+${checkpoint.photos.length - 3} photo(s) supplémentaire(s)`, startX, currentY);
        currentY += 4;
      }
    }
  }

  // Utiliser la position finale
  yPosition = currentY + 3;

  // Plan d'action pour les anomalies - compact
  const anomalies = audit.checkpoints.filter(cp => cp.status === 'NON');
  
  if (anomalies.length > 0 && yPosition < pageHeight - 60) {
    yPosition += 5; // Réduit de 10 à 5
    
    // Titre de la section - compact
    doc.setFontSize(10); // Réduit de 14 à 10
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(warningColor[0], warningColor[1], warningColor[2]);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 6, 'F'); // Réduit la hauteur
    doc.setTextColor(255, 255, 255);
    doc.text('Plan d\'Action - Anomalies', margin + 3, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8; // Réduit de 12 à 8

    // Mapping des actions correctives par type d'anomalie
    const actionPlan: Record<string, string[]> = {
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

    // Générer le plan d'action pour chaque anomalie - format compact
    anomalies.forEach((anomaly, index) => {
      // Vérifier si on a encore de la place
      if (yPosition > pageHeight - 40) {
        return; // Pas assez de place, on arrête
      }
      
      const actions = actionPlan[anomaly.id] || [
        'Analyser la cause',
        'Mettre en place des mesures',
        'Suivre l\'efficacité'
      ];

      // Titre de l'anomalie - compact
      doc.setFontSize(9); // Réduit de 11 à 9
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`[!] ${index + 1}. ${anomaly.label}`, margin, yPosition);
      yPosition += 5; // Réduit de 8 à 5

      // Actions correctives - format compact avec emojis, max 2 actions pour économiser l'espace
      doc.setFontSize(7); // Réduit de 9 à 7
      doc.setFont('helvetica', 'normal');
      
      actions.slice(0, 2).forEach((action) => {
        if (yPosition > pageHeight - 20) return; // Vérifier l'espace
        
        // Case à cocher compacte
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.rect(margin + 8, yPosition - 3, 2, 2, 'S'); // Réduit la taille
        
        // Action - texte tronqué si nécessaire avec case à cocher
        const actionText = doc.getTextWidth(action) > (pageWidth - margin - 20) 
          ? doc.splitTextToSize(action, pageWidth - margin - 20)[0]
          : action;
        doc.text(`[ ] ${actionText}`, margin + 12, yPosition);
        yPosition += 4; // Réduit de 6 à 4
      });

      yPosition += 2; // Réduit de 3 à 2
    });

    // Note de suivi - compacte
    if (yPosition < pageHeight - 15) {
      yPosition += 3;
      doc.setFontSize(7); // Réduit de 9 à 7
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Note: Cocher les actions et suivre au prochain audit.', margin, yPosition);
      yPosition += 5;

      // Date de suivi - sur une ligne
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Suivi: ___________  Responsable: ___________', margin, yPosition);
    }
  }

  // Pied de page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${totalPages} - Genere le ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Générer le nom du fichier
  const fileName = `audit-${siteName.replace(/\s+/g, '-')}-${new Date(audit.date).toISOString().split('T')[0]}.pdf`;
  
  // Télécharger le PDF
  doc.save(fileName);
};

// Générer un rapport pour plusieurs audits
export const generateMultipleAuditsPDF = (audits: Audit[], siteNames: Record<string, string>): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // En-tête
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport d\'Audits Qualité', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${audits.length} audit(s)`, pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;

  audits.forEach((audit, index) => {
    // Nouvelle page pour chaque audit (sauf le premier)
    if (index > 0) {
      doc.addPage();
      yPosition = margin;
    }

    // Informations de l'audit
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Audit #${index + 1}`, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    doc.text(`Date : ${formatDate(audit.date)}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Site : ${siteNames[audit.siteId] || 'Site inconnu'}`, margin, yPosition);
    yPosition += 7;
    
    // Score
    const scoreColor = audit.score >= 80 ? [16, 185, 129] : audit.score >= 60 ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const scoreText = `Score : ${audit.score}%`;
    const scoreWidth = doc.getTextWidth(scoreText);
    doc.rect(margin, yPosition - 8, scoreWidth + 4, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(scoreText, margin + 2, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 12;

    // Résumé
    const ouiCount = audit.checkpoints.filter(cp => cp.status === 'OUI').length;
    const nonCount = audit.checkpoints.filter(cp => cp.status === 'NON').length;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`OUI: ${ouiCount} | NON: ${nonCount}`, margin, yPosition);
    yPosition += 10;
  });

  // Pied de page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${totalPages} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const fileName = `rapport-audits-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

