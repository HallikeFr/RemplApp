'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { useStructures } from '@/lib/hooks/useStructures';
import { vacationsRepository } from '@/lib/repositories/vacations';
import { VacationForm } from '@/components/vacations/VacationForm';
import { PageHeader } from '@/components/ui/PageHeader';
import type { VacationFormData } from '@/types';

export default function NewVacationPage() {
  const router = useRouter();
  const { user } = useUser();
  const { structures } = useStructures(user?.id ?? null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: VacationFormData) {
    if (!user) return;
    setLoading(true);
    try {
      await vacationsRepository.create(user.id, data);
      router.push('/vacations');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la création. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nouvelle vacation" />
      <VacationForm structures={structures} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
