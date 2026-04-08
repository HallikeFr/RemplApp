'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Structure, StructureFormData, TypeStructure, TypeVacation, TarifsStructure } from '@/types';
import { TYPE_VACATION_LABELS } from '@/lib/utils/format';

const TYPES_VACATION: TypeVacation[] = ['scanner', 'irm', 'radio', 'mammo', 'echo', 'autre'];

interface StructureFormProps {
  initial?: Structure;
  onSubmit: (data: StructureFormData) => Promise<void>;
  loading?: boolean;
}

export function StructureForm({ initial, onSubmit, loading = false }: StructureFormProps) {
  const router = useRouter();

  const [nom, setNom] = useState(initial?.nom ?? '');
  const [type, setType] = useState<TypeStructure>(initial?.type ?? 'cabinet_liberal');
  const [adresse, setAdresse] = useState(initial?.adresse ?? '');
  const [interlocuteur, setInterlocuteur] = useState(initial?.interlocuteur ?? '');
  const [telephone, setTelephone] = useState(initial?.telephone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tarifs, setTarifs] = useState<TarifsStructure>(initial?.tarifs ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setTarif(type: TypeVacation, duree: 'heure' | 'demi_journee' | 'journee', val: string) {
    const amount = val === '' ? undefined : parseFloat(val);
    setTarifs((prev) => {
      const updated = { ...prev };
      if (!updated[type]) updated[type] = {};
      if (amount === undefined) {
        delete updated[type]![duree];
        if (Object.keys(updated[type]!).length === 0) delete updated[type];
      } else {
        updated[type] = { ...updated[type], [duree]: amount };
      }
      return updated;
    });
  }

  function getTarif(typeVac: TypeVacation, duree: 'heure' | 'demi_journee' | 'journee'): string {
    return tarifs[typeVac]?.[duree]?.toString() ?? '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = 'Le nom est requis.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSubmit({ nom: nom.trim(), type, adresse, interlocuteur, telephone, email, tarifs, notes });
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-6 space-y-5 pb-8">
      {/* Infos générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input
            id="nom"
            label="Nom *"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Centre d'imagerie du Parc"
            error={errors.nom}
            autoFocus
          />
          <Select
            id="type"
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as TypeStructure)}
          >
            <option value="cabinet_liberal">Cabinet libéral</option>
            <option value="clinique">Clinique</option>
            <option value="centre_imagerie">Centre d'imagerie</option>
            <option value="hopital_prive">Hôpital privé</option>
          </Select>
          <Input
            id="adresse"
            label="Adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="12 rue de la Paix, 75001 Paris"
          />
        </div>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input
            id="interlocuteur"
            label="Interlocuteur"
            value={interlocuteur}
            onChange={(e) => setInterlocuteur(e.target.value)}
            placeholder="Dr. Martin — coordinateur"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="telephone"
              label="Téléphone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="01 23 45 67 89"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@centre.fr"
            />
          </div>
          <Textarea
            id="notes"
            label="Notes libres"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Parking gratuit, accès par l'entrée B..."
          />
        </div>
      </Card>

      {/* Tarifs */}
      <Card>
        <CardHeader>
          <CardTitle>Tarifs par type de vacation</CardTitle>
        </CardHeader>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Renseignez les tarifs habituels. Ils seront suggérés automatiquement lors de la saisie d'une vacation.
        </p>
        <div className="space-y-5">
          {TYPES_VACATION.map((typeVac) => (
            <div key={typeVac}>
              <p className="text-sm font-medium text-[var(--color-text)] mb-2">
                {TYPE_VACATION_LABELS[typeVac]}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['heure', 'demi_journee', 'journee'] as const).map((duree) => (
                  <div key={duree}>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                      {duree === 'heure' ? 'Heure' : duree === 'demi_journee' ? 'Demi-j.' : 'Journée'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={getTarif(typeVac, duree)}
                        onChange={(e) => setTarif(typeVac, duree, e.target.value)}
                        placeholder="—"
                        className="w-full h-9 pl-2 pr-7 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">€</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initial ? 'Enregistrer' : 'Créer la structure'}
        </Button>
      </div>
    </form>
  );
}
