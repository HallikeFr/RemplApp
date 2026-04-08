'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { structuresRepository } from '@/lib/repositories/structures';
import { StructureForm } from './StructureForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Structure, StructureFormData } from '@/types';
import { TYPE_STRUCTURE_LABELS, TYPE_VACATION_LABELS, formatEuros } from '@/lib/utils/format';

interface StructureDetailProps {
  id: string;
}

export function StructureDetail({ id }: StructureDetailProps) {
  const router = useRouter();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    structuresRepository.getById(id).then((s) => {
      setStructure(s ?? null);
      setLoading(false);
    });
  }, [id]);

  async function handleUpdate(data: StructureFormData) {
    setSaving(true);
    try {
      const updated = await structuresRepository.update(id, data);
      setStructure(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${structure?.nom}" ? Cette action est irréversible.`)) return;
    setDeleting(true);
    try {
      await structuresRepository.delete(id);
      router.push('/structures');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-6 pt-6">
        <div className="h-8 w-48 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse mb-4" />
        <div className="h-40 bg-[var(--color-bg-subtle)] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-[var(--color-text-muted)]">Structure introuvable.</p>
        <Link href="/structures" className="text-sm text-[var(--color-primary)] hover:underline mt-2 inline-block">
          ← Retour aux structures
        </Link>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <PageHeader title="Modifier la structure" />
        <StructureForm initial={structure} onSubmit={handleUpdate} loading={saving} />
      </div>
    );
  }

  const typeLabel = TYPE_STRUCTURE_LABELS[structure.type] ?? structure.type;
  const tarifsEntries = Object.entries(structure.tarifs) as [string, Record<string, number>][];

  return (
    <div>
      <PageHeader
        title={structure.nom}
        action={
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Modifier
          </Button>
        }
      />

      <div className="px-4 md:px-6 space-y-4 pb-8">
        {/* Infos générales */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{typeLabel}</Badge>
            </div>
            {structure.adresse && (
              <InfoLine icon="📍" label="Adresse" value={structure.adresse} />
            )}
            {structure.interlocuteur && (
              <InfoLine icon="👤" label="Contact" value={structure.interlocuteur} />
            )}
            {structure.telephone && (
              <InfoLine
                icon="📞"
                label="Téléphone"
                value={
                  <a href={`tel:${structure.telephone}`} className="text-[var(--color-primary)] hover:underline">
                    {structure.telephone}
                  </a>
                }
              />
            )}
            {structure.email && (
              <InfoLine
                icon="✉️"
                label="Email"
                value={
                  <a href={`mailto:${structure.email}`} className="text-[var(--color-primary)] hover:underline">
                    {structure.email}
                  </a>
                }
              />
            )}
            {structure.notes && (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Notes</p>
                <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{structure.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Tarifs */}
        {tarifsEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tarifs configurés</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {tarifsEntries.map(([typeVac, tarifs]) => (
                <div key={typeVac} className="flex items-start justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {TYPE_VACATION_LABELS[typeVac] ?? typeVac}
                  </span>
                  <div className="text-right space-y-0.5">
                    {tarifs.heure !== undefined && (
                      <p className="text-sm text-[var(--color-accent)]">
                        <span className="text-xs text-[var(--color-text-muted)]">/ heure </span>
                        {formatEuros(tarifs.heure)}
                      </p>
                    )}
                    {tarifs.demi_journee !== undefined && (
                      <p className="text-sm text-[var(--color-accent)]">
                        <span className="text-xs text-[var(--color-text-muted)]">/ demi-j. </span>
                        {formatEuros(tarifs.demi_journee)}
                      </p>
                    )}
                    {tarifs.journee !== undefined && (
                      <p className="text-sm text-[var(--color-accent)]">
                        <span className="text-xs text-[var(--color-text-muted)]">/ journée </span>
                        {formatEuros(tarifs.journee)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Zone danger */}
        <Card className="border-[var(--color-danger-bg)]">
          <CardHeader>
            <CardTitle className="text-[var(--color-danger)]">Zone danger</CardTitle>
          </CardHeader>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            La suppression de cette structure entraîne la suppression de toutes les vacations associées.
          </p>
          <Button
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
          >
            Supprimer cette structure
          </Button>
        </Card>
      </div>
    </div>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base leading-5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <div className="text-sm text-[var(--color-text)]">{value}</div>
      </div>
    </div>
  );
}
