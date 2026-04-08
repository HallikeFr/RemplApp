import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Structure } from '@/types';
import { TYPE_STRUCTURE_LABELS } from '@/lib/utils/format';

interface StructureCardProps {
  structure: Structure;
}

export function StructureCard({ structure }: StructureCardProps) {
  const typeLabel = TYPE_STRUCTURE_LABELS[structure.type] ?? structure.type;
  const nbTarifs = Object.keys(structure.tarifs).length;

  return (
    <Link href={`/structures/${structure.id}`}>
      <Card
        padding="md"
        className="hover:border-[var(--color-primary-light)] hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--color-text)] truncate">{structure.nom}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">{typeLabel}</Badge>
              {nbTarifs > 0 && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {nbTarifs} tarif{nbTarifs > 1 ? 's' : ''} configuré{nbTarifs > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {structure.adresse && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1.5 truncate">
                {structure.adresse}
              </p>
            )}
            {structure.interlocuteur && (
              <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                Contact : {structure.interlocuteur}
              </p>
            )}
          </div>
          <svg
            className="w-4 h-4 text-[var(--color-text-light)] shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
