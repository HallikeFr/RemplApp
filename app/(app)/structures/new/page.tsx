'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { structuresRepository } from '@/lib/repositories/structures';
import { StructureForm } from '@/components/structures/StructureForm';
import { PageHeader } from '@/components/ui/PageHeader';
import type { StructureFormData } from '@/types';

export default function NewStructurePage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: StructureFormData) {
    if (!user) return;
    setLoading(true);
    try {
      const created = await structuresRepository.create(user.id, data);
      router.push(`/structures/${created.id}`);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la création. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nouvelle structure" />
      <StructureForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
