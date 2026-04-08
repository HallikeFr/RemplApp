// Formatage des montants en euros
export function formatEuros(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Formatage date ISO → affichage français
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function formatDateShort(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoDate));
}

// Date du jour au format YYYY-MM-DD
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Libellés
export const TYPE_VACATION_LABELS: Record<string, string> = {
  scanner: 'Scanner',
  irm: 'IRM',
  radio: 'Radiologie conv.',
  mammo: 'Mammographie',
  echo: 'Échographie',
  autre: 'Autre',
};

export const DUREE_LABELS: Record<string, string> = {
  heure: 'À l\'heure',
  demi_journee: 'Demi-journée',
  journee: 'Journée',
};

export const TYPE_STRUCTURE_LABELS: Record<string, string> = {
  cabinet_liberal: 'Cabinet libéral',
  clinique: 'Clinique',
  centre_imagerie: 'Centre d\'imagerie',
  hopital_prive: 'Hôpital privé',
};

export const STATUT_LABELS: Record<string, string> = {
  programmee: 'Programmée',
  realisee: 'Réalisée',
  payee: 'Payée',
};
