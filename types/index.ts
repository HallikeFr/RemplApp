// ============================================================
// Types centralisés RemplApp
// ============================================================

// --- Profil fiscal ---

export type SituationFamiliale =
  | 'celibataire'
  | 'pacse'
  | 'marie'
  | 'divorce'
  | 'veuf';

export type CarmfRidClasse = 'A_25' | 'A_pleine';

export interface Profile {
  id: string; // = user_id Supabase
  situation_familiale: SituationFamiliale;
  enfants_garde_complete: number;
  enfants_garde_alternee: number;
  autres_personnes_charge: number;
  parent_isole: boolean;
  nb_parts_fiscales: number; // calculé automatiquement
  salaire_hospitalier_annuel: number;
  revenus_conjoint_annuel: number;
  carmf_rid_classe: CarmfRidClasse;
  created_at: string;
  updated_at: string;
}

// --- Structures ---

export type TypeStructure =
  | 'cabinet_liberal'
  | 'clinique'
  | 'centre_imagerie'
  | 'hopital_prive';

export type TypeVacation =
  | 'scanner'
  | 'irm'
  | 'radio'
  | 'mammo'
  | 'echo'
  | 'autre';

export type DureeVacation = 'heure' | 'demi_journee' | 'journee';

export interface TarifStructure {
  heure?: number;
  demi_journee?: number;
  journee?: number;
}

export type TarifsStructure = Partial<Record<TypeVacation, TarifStructure>>;

export interface Structure {
  id: string;
  user_id: string;
  nom: string;
  type: TypeStructure;
  adresse?: string;
  interlocuteur?: string;
  telephone?: string;
  email?: string;
  tarifs: TarifsStructure;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// --- Vacations ---

export type StatutVacation = 'programmee' | 'realisee' | 'payee';

export interface Vacation {
  id: string;
  user_id: string;
  structure_id: string;
  date: string; // YYYY-MM-DD
  type_vacation: TypeVacation;
  duree: DureeVacation;
  tarif_applique: number;
  statut: StatutVacation;
  google_event_id?: string; // réservé V2
  notes?: string;
  synced: boolean;
  created_at: string;
  updated_at: string;
  // Jointure (non stockée en BDD)
  structure?: Pick<Structure, 'id' | 'nom' | 'type'>;
}

// --- Formulaires (sans les champs gérés auto) ---

export type VacationFormData = Pick<
  Vacation,
  'date' | 'structure_id' | 'type_vacation' | 'duree' | 'tarif_applique' | 'notes'
>;

export type StructureFormData = Omit<
  Structure,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export type ProfileFormData = Omit<
  Profile,
  'id' | 'nb_parts_fiscales' | 'created_at' | 'updated_at'
>;

// --- Dashboard / Fiscalité ---

export interface PeriodeCA {
  mensuel: number;
  trimestriel: number;
  annuel: number;
  projection_annuelle: number;
}

export interface CotisationsURSSAF {
  ca_annuel: number;
  palier: 1 | 2 | 'depasse';
  cotisations_dues: number;
  cotisations_palier1: number;
  cotisations_palier2: number;
  pourcentage_seuil1: number; // 0-100
  pourcentage_seuil2: number; // 0-100
}

export interface SimulationIR {
  ca_brut: number;
  abattement_bnc: number;
  revenu_bnc_imposable: number;
  revenu_salarial_net: number;
  revenu_conjoint: number;
  revenu_global_foyer: number;
  nb_parts: number;
  quotient_familial: number;
  impot_foyer: number;
  impot_part_remplacements: number;
  taux_marginal: number;
  revenu_net_final: number;
}

export interface DashboardData {
  ca: PeriodeCA;
  urssaf: CotisationsURSSAF;
  ir: SimulationIR;
  prochaines_vacations: Vacation[];
  alertes: Alerte[];
}

export type TypeAlerte = 'seuil_urssaf_75' | 'seuil_urssaf_100' | 'vacations_non_payees';

export interface Alerte {
  type: TypeAlerte;
  message: string;
  niveau: 'info' | 'warning' | 'danger';
}

// --- Sync offline ---

export type SyncStatus = 'online' | 'offline' | 'syncing';
