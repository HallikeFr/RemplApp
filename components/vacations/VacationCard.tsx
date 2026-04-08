'use client';

import Link from 'next/link';
import { StatutBadge } from '@/components/ui/Badge';
import type { Vacation } from '@/types';
import {
  formatDateShort,
  formatEuros,
  TYPE_VACATION_LABELS,
  DUREE_LABELS,
} from '@/lib/utils/format';

interface VacationCardProps {
  vacation: Vacation;
  onStatutChange?: (id: string, statut: Vacation['statut']) => void;
}

const STATUT_NEXT: Record<Vacation['statut'], Vacation['statut'] | null> = {
  programmee: 'realisee',
  realisee: 'payee',
  payee: null,
};

const STATUT_NEXT_LABEL: Record<Vacation['statut'], string> = {
  programmee: 'Marquer réalisée',
  realisee: 'Marquer payée',
  payee: '',
};

export function VacationCard({ vacation, onStatutChange }: VacationCardProps) {
  const nextStatut = STATUT_NEXT[vacation.statut];
  const structureNom = vacation.structure?.nom ?? 'Structure inconnue';

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
      <Link href={`/vacations/${vacation.id}`} className="block p-4 hover:bg-[var(--color-bg-subtle)] transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatutBadge statut={vacation.statut} />
              <span className="text-xs text-[var(--color-text-muted)]">
                {formatDateShort(vacation.date)}
              </span>
            </div>
            <p className="font-semibold text-[var(--color-text)] truncate">{structureNom}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {TYPE_VACATION_LABELS[vacation.type_vacation]} · {DUREE_LABELS[vacation.duree]}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-[var(--color-accent)]">
              {formatEuros(vacation.tarif_applique)}
            </p>
          </div>
        </div>
      </Link>

      {/* Action statut rapide */}
      {nextStatut && onStatutChange && (
        <div className="px-4 pb-3">
          <button
            onClick={() => onStatutChange(vacation.id, nextStatut)}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            → {STATUT_NEXT_LABEL[vacation.statut]}
          </button>
        </div>
      )}
    </div>
  );
}
