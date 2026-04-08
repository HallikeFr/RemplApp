'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Structure, VacationFormData, TypeVacation, DureeVacation } from '@/types';
import { TYPE_VACATION_LABELS, DUREE_LABELS, todayISO } from '@/lib/utils/format';

const TYPES_VACATION: TypeVacation[] = ['scanner', 'irm', 'radio', 'mammo', 'echo', 'autre'];
const DUREES: DureeVacation[] = ['heure', 'demi_journee', 'journee'];

interface VacationFormProps {
  structures: Structure[];
  onSubmit: (data: VacationFormData) => Promise<void>;
  loading?: boolean;
}

export function VacationForm({ structures, onSubmit, loading = false }: VacationFormProps) {
  const router = useRouter();

  const [date, setDate] = useState(todayISO());
  const [structureId, setStructureId] = useState(structures[0]?.id ?? '');
  const [typeVacation, setTypeVacation] = useState<TypeVacation>('scanner');
  const [duree, setDuree] = useState<DureeVacation>('demi_journee');
  const [tarifApplique, setTarifApplique] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Suggestion de tarif auto depuis la structure sélectionnée
  useEffect(() => {
    const structure = structures.find((s) => s.id === structureId);
    const suggested = structure?.tarifs?.[typeVacation]?.[duree];
    if (suggested !== undefined) {
      setTarifApplique(suggested.toString());
    }
  }, [structureId, typeVacation, duree, structures]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'La date est requise.';
    if (!structureId) errs.structureId = 'Sélectionnez une structure.';
    if (!tarifApplique || parseFloat(tarifApplique) < 0) errs.tarif = 'Tarif invalide.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    await onSubmit({
      date,
      structure_id: structureId,
      type_vacation: typeVacation,
      duree,
      tarif_applique: parseFloat(tarifApplique),
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-6 space-y-4 pb-8">
      <Card>
        <div className="space-y-4">
          {/* Date */}
          <Input
            id="date"
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />

          {/* Structure */}
          {structures.length === 0 ? (
            <div className="text-sm text-[var(--color-warning)] bg-[var(--color-warning-bg)] px-3 py-2 rounded-lg">
              Aucune structure configurée.{' '}
              <a href="/structures/new" className="underline font-medium">
                Ajouter une structure d'abord.
              </a>
            </div>
          ) : (
            <Select
              id="structure"
              label="Structure *"
              value={structureId}
              onChange={(e) => setStructureId(e.target.value)}
              error={errors.structureId}
            >
              {structures.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </Select>
          )}

          {/* Type + Durée sur la même ligne */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="type"
              label="Type"
              value={typeVacation}
              onChange={(e) => setTypeVacation(e.target.value as TypeVacation)}
            >
              {TYPES_VACATION.map((t) => (
                <option key={t} value={t}>{TYPE_VACATION_LABELS[t]}</option>
              ))}
            </Select>

            <Select
              id="duree"
              label="Durée"
              value={duree}
              onChange={(e) => setDuree(e.target.value as DureeVacation)}
            >
              {DUREES.map((d) => (
                <option key={d} value={d}>{DUREE_LABELS[d]}</option>
              ))}
            </Select>
          </div>

          {/* Tarif */}
          <div>
            <label htmlFor="tarif" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Tarif *
            </label>
            <div className="relative">
              <input
                id="tarif"
                type="number"
                min="0"
                step="0.01"
                value={tarifApplique}
                onChange={(e) => setTarifApplique(e.target.value)}
                placeholder="0.00"
                className={`w-full h-11 pl-3.5 pr-8 rounded-lg border bg-white text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition ${errors.tarif ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">€</span>
            </div>
            {errors.tarif && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.tarif}</p>}
          </div>

          {/* Notes (optionnel) */}
          <Textarea
            id="notes"
            label="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Remarques particulières..."
            rows={2}
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} disabled={structures.length === 0} className="flex-1">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
