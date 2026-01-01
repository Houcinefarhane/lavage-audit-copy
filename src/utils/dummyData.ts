import { Audit, CheckpointStatus } from '../types';

const generateDummyAudits = (): Audit[] => {
  // Générer des IDs de sites aléatoires (site-001 à site-060)
  const generateRandomSiteId = (): string => {
    const siteNum = Math.floor(Math.random() * 60) + 1;
    return `site-${String(siteNum).padStart(3, '0')}`;
  };
  const checkpoints = [
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

  const audits: Audit[] = [];
  const now = new Date();

  // Générer 200 audits sur les 30 derniers jours (répartis sur les 60 sites)
  for (let i = 0; i < 200; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(8 + Math.floor(Math.random() * 10)); // Entre 8h et 18h
    date.setMinutes(Math.floor(Math.random() * 60));

    // Générer des scores variés (entre 50% et 100%)
    const targetScore = 60 + Math.random() * 40;
    const ouiCount = Math.round((targetScore / 100) * checkpoints.length);
    const nonCount = checkpoints.length - ouiCount;

    const checkpointStatuses: CheckpointStatus[] = [];
    for (let j = 0; j < ouiCount; j++) {
      checkpointStatuses.push('OUI');
    }
    for (let j = 0; j < nonCount; j++) {
      checkpointStatuses.push('NON');
    }

    // Mélanger aléatoirement
    for (let j = checkpointStatuses.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [checkpointStatuses[j], checkpointStatuses[k]] = [checkpointStatuses[k], checkpointStatuses[j]];
    }

    const auditCheckpoints = checkpoints.map((cp, idx) => ({
      ...cp,
      status: checkpointStatuses[idx] as CheckpointStatus,
    }));

    const score = Math.round((ouiCount / checkpoints.length) * 100);

    // Sélectionner un site aléatoire
    const randomSiteId = generateRandomSiteId();

    audits.push({
      id: `dummy-${i}`,
      date: date.toISOString(),
      siteId: randomSiteId,
      comment: `Audit auto - Site ${randomSiteId}`,
      checkpoints: auditCheckpoints,
      score,
      totalCheckpoints: checkpoints.length,
    });
  }

  return audits;
};

export const dummyAudits = generateDummyAudits();

