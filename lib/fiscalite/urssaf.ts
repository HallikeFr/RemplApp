import {
  URSSAF_SEUIL_1,
  URSSAF_SEUIL_2,
  URSSAF_TAUX_1,
  URSSAF_TAUX_2,
} from './constants';
import type { CotisationsURSSAF } from '@/types';

/**
 * Calcule les cotisations URSSAF RSPM selon le CA annuel.
 * Palier 1 : CA ≤ 19 000 € → 13,5% sur le CA
 * Palier 2 : 19 001 – 38 000 € → 21,2% sur le CA total
 * Au-delà de 38 000 € : hors périmètre V1
 */
export function calculerURSSAF(caAnnuel: number): CotisationsURSSAF {
  let palier: CotisationsURSSAF['palier'];
  let cotisationsPalier1 = 0;
  let cotisationsPalier2 = 0;

  if (caAnnuel <= URSSAF_SEUIL_1) {
    palier = 1;
    cotisationsPalier1 = caAnnuel * URSSAF_TAUX_1;
  } else if (caAnnuel <= URSSAF_SEUIL_2) {
    palier = 2;
    cotisationsPalier1 = URSSAF_SEUIL_1 * URSSAF_TAUX_1;
    cotisationsPalier2 = (caAnnuel - URSSAF_SEUIL_1) * URSSAF_TAUX_2;
  } else {
    palier = 'depasse';
    cotisationsPalier1 = URSSAF_SEUIL_1 * URSSAF_TAUX_1;
    cotisationsPalier2 = (URSSAF_SEUIL_2 - URSSAF_SEUIL_1) * URSSAF_TAUX_2;
  }

  const cotisationsDues = cotisationsPalier1 + cotisationsPalier2;

  const pourcentageSeuil1 = Math.min(100, (caAnnuel / URSSAF_SEUIL_1) * 100);
  const pourcentageSeuil2 =
    caAnnuel <= URSSAF_SEUIL_1
      ? 0
      : Math.min(100, ((caAnnuel - URSSAF_SEUIL_1) / (URSSAF_SEUIL_2 - URSSAF_SEUIL_1)) * 100);

  return {
    ca_annuel: caAnnuel,
    palier,
    cotisations_dues: cotisationsDues,
    cotisations_palier1: cotisationsPalier1,
    cotisations_palier2: cotisationsPalier2,
    pourcentage_seuil1: pourcentageSeuil1,
    pourcentage_seuil2: pourcentageSeuil2,
  };
}

/**
 * Projette le CA de fin d'année sur la base du rythme actuel.
 */
export function projeterCA(
  caActuel: number,
  jourEcoule: number,
  joursAnnee = 365
): number {
  if (jourEcoule <= 0) return caActuel;
  return (caActuel / jourEcoule) * joursAnnee;
}

/**
 * Retourne le nombre de jours écoulés depuis le 1er janvier de l'année en cours.
 */
export function joursEcoules(): number {
  const now = new Date();
  const debut = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
