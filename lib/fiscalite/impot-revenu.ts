import {
  BAREME_IR,
  ABATTEMENT_BNC,
  ABATTEMENT_SALAIRE,
  ABATTEMENT_SALAIRE_PLAFOND,
  CARMF_A_25,
  CARMF_A_PLEINE,
} from './constants';
import type { SimulationIR, Profile } from '@/types';

/**
 * Applique le barème progressif IR sur un revenu donné (quotient familial).
 * Retourne l'impôt sur 1 part, qui sera ensuite multiplié par le nombre de parts.
 */
function impotSurQuotient(revenu: number): number {
  let impot = 0;

  for (let i = BAREME_IR.length - 1; i >= 0; i--) {
    const tranche = BAREME_IR[i];
    const trancheSuivante = BAREME_IR[i + 1];

    if (revenu > tranche.seuil) {
      const plafond = trancheSuivante ? trancheSuivante.seuil : Infinity;
      const base = Math.min(revenu, plafond) - tranche.seuil;
      impot += base * tranche.taux;
    }
  }

  return Math.max(0, impot);
}

/**
 * Retourne le taux marginal d'imposition pour un revenu donné.
 */
function tauxMarginal(revenu: number): number {
  for (let i = BAREME_IR.length - 1; i >= 0; i--) {
    if (revenu > BAREME_IR[i].seuil) {
      return BAREME_IR[i].taux;
    }
  }
  return 0;
}

/**
 * Simulation IR complète du foyer fiscal.
 *
 * Règles micro-BNC (CORRIGÉ) :
 *   BNC imposable = CA × (1 - 34%)
 *   Note : PAS de soustraction des cotisations URSSAF (abattement forfaitaire couvre les charges)
 */
export function simulerIR(
  caBrut: number,
  profile: Pick<
    Profile,
    | 'salaire_hospitalier_annuel'
    | 'revenus_conjoint_annuel'
    | 'nb_parts_fiscales'
    | 'carmf_rid_classe'
  >,
  cotisationsURSSAF: number
): SimulationIR {
  // 1. Revenu BNC imposable (abattement forfaitaire 34% uniquement)
  const abattementBNC = caBrut * ABATTEMENT_BNC;
  const revenuBNCImposable = caBrut - abattementBNC;

  // 2. Revenu salarial net (abattement 10% plafonné)
  const abattementSalaireRaw = profile.salaire_hospitalier_annuel * ABATTEMENT_SALAIRE;
  const abattementSalaire = Math.min(abattementSalaireRaw, ABATTEMENT_SALAIRE_PLAFOND);
  const revenuSalarialNet = profile.salaire_hospitalier_annuel - abattementSalaire;

  // 3. CARMF-RID (non déductible en micro-BNC, mais soustrait du revenu net final)
  const carmf =
    profile.carmf_rid_classe === 'A_25' ? CARMF_A_25 : CARMF_A_PLEINE;

  // 4. Revenu global du foyer
  const revenuGlobalFoyer =
    revenuBNCImposable + revenuSalarialNet + profile.revenus_conjoint_annuel;

  // 5. Quotient familial
  const nbParts = profile.nb_parts_fiscales;
  const quotientFamilial = revenuGlobalFoyer / nbParts;

  // 6. Calcul IR
  const impotSurUne = impotSurQuotient(quotientFamilial);
  const impotFoyer = impotSurUne * nbParts;

  // 7. Part IR attribuable aux remplacements (prorata BNC sur le foyer)
  const partBNC =
    revenuGlobalFoyer > 0 ? revenuBNCImposable / revenuGlobalFoyer : 0;
  const impotPartRemplacements = impotFoyer * partBNC;

  // 8. Taux marginal effectif sur quotient
  const tmCorrige = tauxMarginal(quotientFamilial);

  // 9. Revenu net final
  const revenuNetFinal =
    caBrut - cotisationsURSSAF - carmf - impotPartRemplacements;

  return {
    ca_brut: caBrut,
    abattement_bnc: abattementBNC,
    revenu_bnc_imposable: revenuBNCImposable,
    revenu_salarial_net: revenuSalarialNet,
    revenu_conjoint: profile.revenus_conjoint_annuel,
    revenu_global_foyer: revenuGlobalFoyer,
    nb_parts: nbParts,
    quotient_familial: quotientFamilial,
    impot_foyer: impotFoyer,
    impot_part_remplacements: impotPartRemplacements,
    taux_marginal: tmCorrige,
    revenu_net_final: revenuNetFinal,
  };
}
