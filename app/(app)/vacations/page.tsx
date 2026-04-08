import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function VacationsPage() {
  return (
    <div>
      <PageHeader
        title="Vacations"
        subtitle="Planning et historique"
        action={
          <Link href="/vacations/new">
            <Button size="sm">+ Nouvelle vacation</Button>
          </Link>
        }
      />
      <div className="px-4 md:px-6">
        <p className="text-sm text-[var(--color-text-muted)]">
          Liste et calendrier — à venir (Phase 3)
        </p>
      </div>
    </div>
  );
}
