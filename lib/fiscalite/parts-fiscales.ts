import type { Profile } from '@/types';

/**
 * Calcule le nombre de parts fiscales automatiquement.
 *
 * Règles simplifiées 2025 :
 * - Célibataire / divorcé / veuf : 1 part
 * - Marié / pacsé : 2 parts
 * - 1er et 2ème enfant (garde complète) : +0,5 par enfant
 * - 3ème enfant et au-delà (garde complète) : +1 par enfant
 * - Enfant en garde alternée : moitié des parts (0,25 ou 0,5)
 * - Parent isolé : +0,5 part supplémentaire
 */
export function calculerPartsFiscales(
  profile: Pick<
    Profile,
    | 'situation_familiale'
    | 'enfants_garde_complete'
    | 'enfants_garde_alternee'
    | 'parent_isole'
  >
): number {
  const { situation_familiale, enfants_garde_complete, enfants_garde_alternee, parent_isole } =
    profile;

  // Parts de base selon situation familiale
  let parts =
    situation_familiale === 'marie' || situation_familiale === 'pacse' ? 2 : 1;

  // Enfants en garde complète
  const n = enfants_garde_complete;
  if (n >= 1) parts += 0.5; // 1er enfant
  if (n >= 2) parts += 0.5; // 2ème enfant
  if (n >= 3) parts += (n - 2) * 1; // 3ème enfant et suivants

  // Enfants en garde alternée (moitié des parts)
  const nA = enfants_garde_alternee;
  if (nA >= 1) parts += 0.25; // équivaut à 0,5 / 2
  if (nA >= 2) parts += 0.25;
  if (nA >= 3) parts += (nA - 2) * 0.5;

  // Parent isolé
  if (parent_isole) parts += 0.5;

  // Arrondi à 0,5 le plus proche
  return Math.round(parts * 2) / 2;
}
