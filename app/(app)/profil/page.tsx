import { PageHeader } from '@/components/ui/PageHeader';
import { ProfilForm } from '@/components/profil/ProfilForm';

export default function ProfilPage() {
  return (
    <div>
      <PageHeader
        title="Profil"
        subtitle="Configuration personnelle et fiscale"
      />
      <ProfilForm />
    </div>
  );
}
