import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function ProfilPage() {
  return (
    <div>
      <PageHeader
        title="Profil"
        subtitle="Configuration personnelle et fiscale"
      />
      <div className="px-4 md:px-6 space-y-4">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Profil fiscal — à venir (Phase 4)
          </p>
        </Card>
      </div>
    </div>
  );
}
