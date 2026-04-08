'use client';

import { useState, useEffect } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/lib/hooks/useProfile';
import { useUser } from '@/lib/hooks/useUser';
import { calculerPartsFiscales } from '@/lib/fiscalite/parts-fiscales';
import type { ProfileFormData, SituationFamiliale, CarmfRidClasse } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ProfilForm() {
  const router = useRouter();
  const { user } = useUser();
  const { profile, loading, save } = useProfile(user?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Champs du formulaire
  const [situationFamiliale, setSituationFamiliale] = useState<SituationFamiliale>('celibataire');
  const [enfantsGardeComplete, setEnfantsGardeComplete] = useState(0);
  const [enfantsGardeAlternee, setEnfantsGardeAlternee] = useState(0);
  const [parentIsole, setParentIsole] = useState(false);
  const [salaireHospitalier, setSalaireHospitalier] = useState('');
  const [revenusConjoint, setRevenusConjoint] = useState('');
  const [carmf, setCarmf] = useState<CarmfRidClasse>('A_25');

  // Prépopuler depuis le profil existant
  useEffect(() => {
    if (!profile) return;
    setSituationFamiliale(profile.situation_familiale);
    setEnfantsGardeComplete(profile.enfants_garde_complete);
    setEnfantsGardeAlternee(profile.enfants_garde_alternee);
    setParentIsole(profile.parent_isole);
    setSalaireHospitalier(profile.salaire_hospitalier_annuel.toString());
    setRevenusConjoint(profile.revenus_conjoint_annuel.toString());
    setCarmf(profile.carmf_rid_classe);
  }, [profile]);

  // Calcul dynamique des parts fiscales
  const partsFiscalesPreview = calculerPartsFiscales({
    situation_familiale: situationFamiliale,
    enfants_garde_complete: enfantsGardeComplete,
    enfants_garde_alternee: enfantsGardeAlternee,
    parent_isole: parentIsole,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data: ProfileFormData = {
      situation_familiale: situationFamiliale,
      enfants_garde_complete: enfantsGardeComplete,
      enfants_garde_alternee: enfantsGardeAlternee,
      autres_personnes_charge: profile?.autres_personnes_charge ?? 0,
      parent_isole: parentIsole,
      salaire_hospitalier_annuel: parseFloat(salaireHospitalier) || 0,
      revenus_conjoint_annuel: parseFloat(revenusConjoint) || 0,
      carmf_rid_classe: carmf,
    };
    await save(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-6 space-y-5 pb-8">
      {/* Situation familiale */}
      <Card>
        <CardHeader>
          <CardTitle>Situation familiale</CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">Parts fiscales :</span>
            <Badge variant="accent">{partsFiscalesPreview} part{partsFiscalesPreview > 1 ? 's' : ''}</Badge>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <Select
            id="situation"
            label="Situation"
            value={situationFamiliale}
            onChange={(e) => setSituationFamiliale(e.target.value as SituationFamiliale)}
          >
            <option value="celibataire">Célibataire</option>
            <option value="pacse">Pacsé(e)</option>
            <option value="marie">Marié(e)</option>
            <option value="divorce">Divorcé(e)</option>
            <option value="veuf">Veuf / Veuve</option>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="enfants-complete"
              label="Enfants garde complète"
              type="number"
              min="0"
              max="20"
              value={enfantsGardeComplete}
              onChange={(e) => setEnfantsGardeComplete(parseInt(e.target.value) || 0)}
            />
            <Input
              id="enfants-alternee"
              label="Enfants garde alternée"
              type="number"
              min="0"
              max="20"
              value={enfantsGardeAlternee}
              onChange={(e) => setEnfantsGardeAlternee(parseInt(e.target.value) || 0)}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parentIsole}
              onChange={(e) => setParentIsole(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)]">Parent isolé (+0,5 part)</span>
          </label>
        </div>
      </Card>

      {/* Revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus du foyer fiscal</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="salaire" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Salaire hospitalier annuel brut
            </label>
            <div className="relative">
              <input
                id="salaire"
                type="number"
                min="0"
                step="100"
                value={salaireHospitalier}
                onChange={(e) => setSalaireHospitalier(e.target.value)}
                placeholder="40 000"
                className="w-full h-11 pl-3.5 pr-8 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">€</span>
            </div>
          </div>

          <div>
            <label htmlFor="conjoint" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Revenus annuels du conjoint
              <span className="text-xs text-[var(--color-text-muted)] ml-1">(laisser 0 si non applicable)</span>
            </label>
            <div className="relative">
              <input
                id="conjoint"
                type="number"
                min="0"
                step="100"
                value={revenusConjoint}
                onChange={(e) => setRevenusConjoint(e.target.value)}
                placeholder="0"
                className="w-full h-11 pl-3.5 pr-8 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">€</span>
            </div>
          </div>
        </div>
      </Card>

      {/* CARMF-RID */}
      <Card>
        <CardHeader>
          <CardTitle>CARMF-RID</CardTitle>
        </CardHeader>
        <Select
          id="carmf"
          label="Classe de cotisation"
          value={carmf}
          onChange={(e) => setCarmf(e.target.value as CarmfRidClasse)}
        >
          <option value="A_25">Classe A à 25% — 158 €/an</option>
          <option value="A_pleine">Classe A pleine — 631 €/an</option>
        </Select>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-[var(--color-warning-bg)] border border-[var(--color-warning)] border-opacity-30 px-4 py-3 rounded-lg">
        <svg className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-[var(--color-text-muted)]">
          <strong>Simulation indicative</strong> — ne remplace pas un expert-comptable. Les calculs sont basés sur le barème IR 2025 (revenus 2024).
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button type="submit" loading={saving} className="w-full">
          {saved ? '✓ Enregistré' : 'Enregistrer'}
        </Button>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-sm font-medium text-[var(--color-text)] mb-1">
            {user?.email}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-[var(--color-danger)] hover:underline"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </form>
  );
}
