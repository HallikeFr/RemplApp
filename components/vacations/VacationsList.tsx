'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useVacations } from '@/lib/hooks/useVacations';
import { useStructures } from '@/lib/hooks/useStructures';
import { useUser } from '@/lib/hooks/useUser';
import { VacationCard } from './VacationCard';
import { MonthCalendar } from './MonthCalendar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatEuros } from '@/lib/utils/format';
import type { Vacation } from '@/types';

type ViewMode = 'liste' | 'calendrier';

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function VacationsList() {
  const { user } = useUser();
  const { vacations, loading, error, updateStatut } = useVacations(user?.id ?? null);
  const { structures } = useStructures(user?.id ?? null);

  const today = new Date();
  const [view, setView] = useState<ViewMode>('liste');
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Filtres liste
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterStructure, setFilterStructure] = useState<string>('all');
  const [filterPeriode, setFilterPeriode] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = [...vacations];

    if (filterStatut !== 'all') {
      result = result.filter((v) => v.statut === filterStatut);
    }
    if (filterStructure !== 'all') {
      result = result.filter((v) => v.structure_id === filterStructure);
    }
    if (filterPeriode !== 'all') {
      const now = new Date();
      result = result.filter((v) => {
        const d = new Date(v.date);
        if (filterPeriode === 'mois') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        if (filterPeriode === 'trimestre') {
          const q = Math.floor(now.getMonth() / 3);
          return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
        }
        if (filterPeriode === 'annee') {
          return d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }
    return result;
  }, [vacations, filterStatut, filterStructure, filterPeriode]);

  const totalCA = filtered
    .filter((v) => v.statut !== 'programmee')
    .reduce((sum, v) => sum + v.tarif_applique, 0);

  // Vacations du mois affiché dans le calendrier
  const calVacations = useMemo(() => {
    return vacations.filter((v) => {
      const d = new Date(v.date);
      return d.getFullYear() === calYear && d.getMonth() === calMonth;
    });
  }, [vacations, calYear, calMonth]);

  async function handleStatutChange(id: string, statut: Vacation['statut']) {
    await updateStatut(id, statut);
  }

  return (
    <div>
      <PageHeader
        title="Vacations"
        action={
          <Link href="/vacations/new">
            <Button size="sm">+ Nouvelle</Button>
          </Link>
        }
      />

      <div className="px-4 md:px-6 space-y-4">
        {/* Toggle vue */}
        <div className="flex items-center gap-1 bg-[var(--color-bg-subtle)] rounded-lg p-1 self-start w-fit">
          {(['liste', 'calendrier'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition capitalize ${
                view === v
                  ? 'bg-white text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* ===== Vue LISTE ===== */}
        {view === 'liste' && (
          <>
            {/* Filtres */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterPeriode}
                onChange={(e) => setFilterPeriode(e.target.value)}
                className="h-8 px-2 rounded-lg border border-[var(--color-border)] bg-white text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="all">Toute période</option>
                <option value="mois">Ce mois</option>
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
              </select>

              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="h-8 px-2 rounded-lg border border-[var(--color-border)] bg-white text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="all">Tous statuts</option>
                <option value="programmee">Programmée</option>
                <option value="realisee">Réalisée</option>
                <option value="payee">Payée</option>
              </select>

              {structures.length > 0 && (
                <select
                  value={filterStructure}
                  onChange={(e) => setFilterStructure(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-[var(--color-border)] bg-white text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="all">Toutes structures</option>
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Bande CA */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between bg-[#E8F0EC] rounded-lg px-4 py-2.5">
                <span className="text-sm text-[var(--color-primary)]">
                  CA période ({filtered.filter((v) => v.statut !== 'programmee').length} vacations)
                </span>
                <span className="font-bold text-[var(--color-primary)]">{formatEuros(totalCA)}</span>
              </div>
            )}

            {/* États */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" />
                ))}
              </div>
            )}
            {error && (
              <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-14">
                <p className="font-medium text-[var(--color-text)] mb-1">Aucune vacation</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  {vacations.length > 0 ? 'Modifiez les filtres.' : 'Ajoutez votre première vacation.'}
                </p>
                <Link href="/vacations/new">
                  <Button>+ Nouvelle vacation</Button>
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {filtered.map((v) => (
                <VacationCard key={v.id} vacation={v} onStatutChange={handleStatutChange} />
              ))}
            </div>
          </>
        )}

        {/* ===== Vue CALENDRIER ===== */}
        {view === 'calendrier' && (
          <Card>
            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                  else setCalMonth(m => m - 1);
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {MOIS_FR[calMonth]} {calYear}
              </p>
              <button
                onClick={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                  else setCalMonth(m => m + 1);
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <MonthCalendar year={calYear} month={calMonth} vacations={calVacations} />

            {/* Vacations du mois */}
            {calVacations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {calVacations.length} vacation{calVacations.length > 1 ? 's' : ''} ce mois
                </p>
                {calVacations.map((v) => (
                  <VacationCard key={v.id} vacation={v} onStatutChange={handleStatutChange} />
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* FAB — bouton action rapide mobile */}
      <Link
        href="/vacations/new"
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-hover)] transition z-40"
        aria-label="Nouvelle vacation"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
