'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { vacationsRepository } from '@/lib/repositories/vacations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatutBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  formatDate,
  formatEuros,
  TYPE_VACATION_LABELS,
  DUREE_LABELS,
  STATUT_LABELS,
} from '@/lib/utils/format';
import type { Vacation } from '@/types';

const STATUT_NEXT: Record<Vacation['statut'], Vacation['statut'] | null> = {
  programmee: 'realisee',
  realisee: 'payee',
  payee: null,
};

export default function VacationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [vacation, setVacation] = useState<Vacation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      vacationsRepository.getById(id).then((v) => {
        setVacation(v ?? null);
        setLoading(false);
      });
    });
  }, [params]);

  async function handleStatut(newStatut: Vacation['statut']) {
    if (!vacation) return;
    setUpdating(true);
    const updated = await vacationsRepository.updateStatut(vacation.id, newStatut);
    setVacation(updated);
    setUpdating(false);
  }

  async function handleDelete() {
    if (!vacation) return;
    if (!confirm('Supprimer cette vacation ?')) return;
    setDeleting(true);
    await vacationsRepository.delete(vacation.id);
    router.push('/vacations');
  }

  if (loading) {
    return <div className="px-4 pt-6"><div className="h-40 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" /></div>;
  }

  if (!vacation) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-[var(--color-text-muted)]">Vacation introuvable.</p>
        <Link href="/vacations" className="text-sm text-[var(--color-primary)] hover:underline mt-2 inline-block">← Retour</Link>
      </div>
    );
  }

  const nextStatut = STATUT_NEXT[vacation.statut];

  return (
    <div>
      <PageHeader
        title={vacation.structure?.nom ?? 'Vacation'}
        subtitle={formatDate(vacation.date)}
      />

      <div className="px-4 md:px-6 space-y-4 pb-8">
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StatutBadge statut={vacation.statut} />
              <span className="text-xl font-bold text-[var(--color-accent)]">
                {formatEuros(vacation.tarif_applique)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm pt-2 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Type</span>
              <span className="font-medium">{TYPE_VACATION_LABELS[vacation.type_vacation]}</span>
              <span className="text-[var(--color-text-muted)]">Durée</span>
              <span className="font-medium">{DUREE_LABELS[vacation.duree]}</span>
              <span className="text-[var(--color-text-muted)]">Statut</span>
              <span className="font-medium">{STATUT_LABELS[vacation.statut]}</span>
            </div>
            {vacation.notes && (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Notes</p>
                <p className="text-sm">{vacation.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Avancement statut */}
        {nextStatut && (
          <Button
            variant="primary"
            className="w-full"
            loading={updating}
            onClick={() => handleStatut(nextStatut)}
          >
            Marquer comme {STATUT_LABELS[nextStatut].toLowerCase()}
          </Button>
        )}

        {/* Zone danger */}
        <Card className="border-[var(--color-danger-bg)]">
          <Button
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
          >
            Supprimer cette vacation
          </Button>
        </Card>
      </div>
    </div>
  );
}
