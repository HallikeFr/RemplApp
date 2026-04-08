'use client';

import { useState, useEffect, useCallback } from 'react';
import { structuresRepository } from '@/lib/repositories/structures';
import type { Structure, StructureFormData } from '@/types';

interface UseStructuresResult {
  structures: Structure[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: StructureFormData) => Promise<Structure>;
  update: (id: string, data: Partial<StructureFormData>) => Promise<Structure>;
  remove: (id: string) => Promise<void>;
}

export function useStructures(userId: string | null): UseStructuresResult {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await structuresRepository.getAll(userId);
      setStructures(data);
    } catch (e) {
      setError('Impossible de charger les structures.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (data: StructureFormData): Promise<Structure> => {
      if (!userId) throw new Error('Non authentifié');
      const created = await structuresRepository.create(userId, data);
      setStructures((prev) => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
      return created;
    },
    [userId]
  );

  const update = useCallback(
    async (id: string, data: Partial<StructureFormData>): Promise<Structure> => {
      const updated = await structuresRepository.update(id, data);
      setStructures((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    await structuresRepository.delete(id);
    setStructures((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { structures, loading, error, refetch: fetch, create, update, remove };
}
