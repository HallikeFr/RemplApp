import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function StructuresPage() {
  return (
    <div>
      <PageHeader
        title="Structures"
        subtitle="Cabinets, cliniques et centres"
        action={
          <Link href="/structures/new">
            <Button size="sm">+ Ajouter</Button>
          </Link>
        }
      />
      <div className="px-4 md:px-6">
        <p className="text-sm text-[var(--color-text-muted)]">
          Répertoire des structures — à venir (Phase 2)
        </p>
      </div>
    </div>
  );
}
