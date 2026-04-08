// ============================================================
// Constantes fiscales — à mettre à jour chaque année fiscale
// ============================================================

// --- URSSAF RSPM (Régime Simplifié des Professions Médicales) ---

export const URSSAF_SEUIL_1 = 19_000; // €
export const URSSAF_SEUIL_2 = 38_000; // €
export const URSSAF_TAUX_1 = 0.135;   // 13,5%
export const URSSAF_TAUX_2 = 0.212;   // 21,2%

// --- CARMF-RID ---

export const CARMF_A_25 = 158;    // € — Classe A à 25%
export const CARMF_A_PLEINE = 631; // € — Classe A pleine

// --- Impôt sur le revenu — Barème 2025 (revenus 2024) ---
// IMPORTANT : mettre à jour chaque année fiscale

export const BAREME_IR_2025 = [
  { seuil: 0,       taux: 0.00 },
  { seuil: 11_497,  taux: 0.11 },
  { seuil: 29_315,  taux: 0.30 },
  { seuil: 83_823,  taux: 0.41 },
  { seuil: 180_294, taux: 0.45 },
];

// Barème actif (pointer vers BAREME_IR_2025 pour l'année en cours)
export const BAREME_IR = BAREME_IR_2025;

// --- Abattements ---

export const ABATTEMENT_BNC = 0.34;             // 34% micro-BNC
export const ABATTEMENT_SALAIRE = 0.10;         // 10% frais professionnels
export const ABATTEMENT_SALAIRE_PLAFOND = 12_829; // € plafond 2025
