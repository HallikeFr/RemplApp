import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Vue d'ensemble de vos remplacements"
      />
      <div className="px-4 md:px-6 space-y-4">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            KPIs et simulation fiscale — à venir (Phase 4)
          </p>
        </Card>
      </div>
    </div>
  );
}
