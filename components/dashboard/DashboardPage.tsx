'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { useVacations } from '@/lib/hooks/useVacations';
import { useProfile } from '@/lib/hooks/useProfile';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatutBadge } from '@/components/ui/Badge';
import { calculerURSSAF, projeterCA, joursEcoules } from '@/lib/fiscalite/urssaf';
import { simulerIR } from '@/lib/fiscalite/impot-revenu';
import { URSSAF_SEUIL_1, URSSAF_SEUIL_2, CARMF_A_25, CARMF_A_PLEINE } from '@/lib/fiscalite/constants';
import { formatEuros, formatDateShort, TYPE_VACATION_LABELS } from '@/lib/utils/format';

export function DashboardPage() {
  const { user } = useUser();
  const { vacations, loading: loadingVac } = useVacations(user?.id ?? null);
  const { profile, loading: loadingProfile } = useProfile(user?.id ?? null);
  const { online, syncCount } = useOnlineStatus(user?.id ?? null);

  const loading = loadingVac || loadingProfile;

  // --- Calculs CA ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentQ = Math.floor(currentMonth / 3);

  const caData = useMemo(() => {
    const realized = vacations.filter((v) => v.statut !== 'programmee');

    const mensuel = realized
      .filter((v) => {
        const d = new Date(v.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, v) => s + v.tarif_applique, 0);

    const trimestriel = realized
      .filter((v) => {
        const d = new Date(v.date);
        return Math.floor(d.getMonth() / 3) === currentQ && d.getFullYear() === currentYear;
      })
      .reduce((s, v) => s + v.tarif_applique, 0);

    const annuel = realized
      .filter((v) => new Date(v.date).getFullYear() === currentYear)
      .reduce((s, v) => s + v.tarif_applique, 0);

    const projection = projeterCA(annuel, joursEcoules());

    return { mensuel, trimestriel, annuel, projection };
  }, [vacations, currentMonth, currentYear, currentQ]);

  // --- URSSAF ---
  const urssaf = useMemo(() => calculerURSSAF(caData.annuel), [caData.annuel]);

  // --- IR ---
  const irSimulation = useMemo(() => {
    if (!profile) return null;
    return simulerIR(caData.annuel, profile, urssaf.cotisations_dues);
  }, [caData.annuel, profile, urssaf.cotisations_dues]);

  // --- Alertes ---
  const alertes = useMemo(() => {
    const list: { message: string; niveau: 'warning' | 'danger' }[] = [];
    if (urssaf.pourcentage_seuil1 >= 75 && urssaf.pourcentage_seuil1 < 100) {
      list.push({ message: `Vous approchez du seuil URSSAF palier 1 (${Math.round(urssaf.pourcentage_seuil1)}%)`, niveau: 'warning' });
    }
    if (urssaf.pourcentage_seuil1 >= 100) {
      list.push({ message: `Seuil URSSAF palier 1 atteint (19 000 €) — taux 21,2% en vigueur`, niveau: 'danger' });
    }
    if (urssaf.pourcentage_seuil2 >= 75 && urssaf.pourcentage_seuil2 < 100) {
      list.push({ message: `Vous approchez du seuil URSSAF palier 2 (${Math.round(urssaf.pourcentage_seuil2)}%)`, niveau: 'warning' });
    }
    if (urssaf.palier === 'depasse') {
      list.push({ message: `CA > 38 000 € — Sortie du RSPM à gérer avec votre comptable`, niveau: 'danger' });
    }
    const nonPayees = vacations.filter((v) => v.statut === 'realisee');
    if (nonPayees.length >= 3) {
      list.push({ message: `${nonPayees.length} vacations réalisées mais non marquées comme payées`, niveau: 'warning' });
    }
    return list;
  }, [urssaf, vacations]);

  // --- Prochaines vacations ---
  const prochaines = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return vacations
      .filter((v) => v.statut === 'programmee' && v.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [vacations]);

  const carmfMontant = profile?.carmf_rid_classe === 'A_25' ? CARMF_A_25 : CARMF_A_PLEINE;

  return (
    <div>
      {/* Header */}
      <div className="px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{currentYear}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
            <span className="text-xs text-[var(--color-text-muted)]">{online ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
        {syncCount > 0 && (
          <p className="text-xs text-[var(--color-success)] mt-1">
            {syncCount} vacation{syncCount > 1 ? 's' : ''} synchronisée{syncCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="px-4 md:px-6 space-y-4 pb-8">
        {/* Alertes */}
        {alertes.length > 0 && (
          <div className="space-y-2">
            {alertes.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm ${
                  a.niveau === 'danger'
                    ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                    : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                }`}
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {a.message}
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* KPI CA */}
            <Card>
              <CardHeader>
                <CardTitle>Chiffre d'affaires remplacements</CardTitle>
                <Badge variant="primary">{currentYear}</Badge>
              </CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <KPIBloc label="Ce mois" value={formatEuros(caData.mensuel)} />
                <KPIBloc label="Ce trimestre" value={formatEuros(caData.trimestriel)} />
                <KPIBloc label="Annuel (réalisé)" value={formatEuros(caData.annuel)} accent />
                <KPIBloc label="Projection fin d'année" value={formatEuros(caData.projection)} muted />
              </div>
            </Card>

            {/* URSSAF */}
            <Card>
              <CardHeader>
                <CardTitle>Cotisations URSSAF (RSPM)</CardTitle>
                <Badge variant={urssaf.palier === 'depasse' ? 'danger' : urssaf.palier === 2 ? 'warning' : 'default'}>
                  Palier {urssaf.palier === 'depasse' ? '> 38k€' : urssaf.palier}
                </Badge>
              </CardHeader>

              {/* Barre palier 1 */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                    <span>Seuil 1 : {formatEuros(URSSAF_SEUIL_1)}</span>
                    <span>{Math.round(urssaf.pourcentage_seuil1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-bg-subtle)]">
                    <div
                      className={`h-2 rounded-full transition-all ${urssaf.pourcentage_seuil1 >= 100 ? 'bg-[var(--color-danger)]' : urssaf.pourcentage_seuil1 >= 75 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-primary)]'}`}
                      style={{ width: `${Math.min(100, urssaf.pourcentage_seuil1)}%` }}
                    />
                  </div>
                </div>
                {caData.annuel > URSSAF_SEUIL_1 && (
                  <div>
                    <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                      <span>Seuil 2 : {formatEuros(URSSAF_SEUIL_2)}</span>
                      <span>{Math.round(urssaf.pourcentage_seuil2)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-bg-subtle)]">
                      <div
                        className={`h-2 rounded-full transition-all ${urssaf.pourcentage_seuil2 >= 100 ? 'bg-[var(--color-danger)]' : urssaf.pourcentage_seuil2 >= 75 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-accent)]'}`}
                        style={{ width: `${Math.min(100, urssaf.pourcentage_seuil2)}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
                  <span className="text-sm text-[var(--color-text-muted)]">Cotisations dues</span>
                  <span className="font-semibold text-[var(--color-text)]">{formatEuros(urssaf.cotisations_dues)}</span>
                </div>
              </div>
            </Card>

            {/* Simulation IR */}
            {irSimulation ? (
              <Card>
                <CardHeader>
                  <CardTitle>Simulation fiscale</CardTitle>
                  <span className="text-xs text-[var(--color-text-muted)]">Indicatif</span>
                </CardHeader>
                <div className="space-y-2">
                  <SimLine label="Revenu BNC imposable" value={formatEuros(irSimulation.revenu_bnc_imposable)} />
                  <SimLine label="Revenu salarial net" value={formatEuros(irSimulation.revenu_salarial_net)} />
                  <SimLine label="Revenu global foyer" value={formatEuros(irSimulation.revenu_global_foyer)} />
                  <SimLine label={`Parts fiscales (${irSimulation.nb_parts})`} value={`Quotient : ${formatEuros(irSimulation.quotient_familial)}`} />
                  <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                    <SimLine label="IR foyer estimé" value={formatEuros(irSimulation.impot_foyer)} bold />
                    <SimLine label="Part IR remplacements" value={formatEuros(irSimulation.impot_part_remplacements)} />
                    <SimLine label="TMI atteint" value={`${(irSimulation.taux_marginal * 100).toFixed(0)}%`} />
                  </div>
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-[var(--color-text)]">Revenu net final</span>
                      <span className="text-lg font-bold text-[var(--color-accent)]">
                        {formatEuros(irSimulation.revenu_net_final)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      CA − URSSAF ({formatEuros(urssaf.cotisations_dues)}) − CARMF ({formatEuros(carmfMontant)}) − IR remplacements
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-dashed">
                <p className="text-sm text-[var(--color-text-muted)] text-center">
                  Configurez votre{' '}
                  <Link href="/profil" className="text-[var(--color-primary)] hover:underline">profil fiscal</Link>
                  {' '}pour afficher la simulation IR.
                </p>
              </Card>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-[var(--color-text-light)] text-center">
              Simulation indicative — ne remplace pas un expert-comptable
            </p>

            {/* Prochaines vacations */}
            <Card>
              <CardHeader>
                <CardTitle>Prochaines vacations</CardTitle>
                <Link href="/vacations" className="text-xs text-[var(--color-primary)] hover:underline">
                  Voir tout
                </Link>
              </CardHeader>
              {prochaines.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">Aucune vacation programmée</p>
                  <Link href="/vacations/new" className="text-sm text-[var(--color-primary)] hover:underline">
                    + Ajouter une vacation
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {prochaines.map((v) => (
                    <Link key={v.id} href={`/vacations/${v.id}`} className="flex items-center justify-between py-2 hover:opacity-80 transition">
                      <div>
                        <p className="text-sm font-medium">{v.structure?.nom ?? '—'}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {formatDateShort(v.date)} · {TYPE_VACATION_LABELS[v.type_vacation]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-accent)]">{formatEuros(v.tarif_applique)}</p>
                        <StatutBadge statut={v.statut} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function KPIBloc({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-[var(--color-accent)]' : muted ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-primary)]'}`}>
        {value}
      </p>
    </div>
  );
}

function SimLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold' : 'text-[var(--color-text-muted)]'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-[var(--color-text)]' : 'text-[var(--color-text)]'}`}>{value}</span>
    </div>
  );
}
