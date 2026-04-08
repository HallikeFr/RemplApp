'use client';

import { useState, useEffect, useCallback } from 'react';
import { vacationsRepository } from '@/lib/repositories/vacations';
import type { Vacation, VacationFormData } from '@/types';

interface UseVacationsResult {
  vacations: Vacation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: VacationFormData) => Promise<Vacation>;
  updateStatut: (id: string, statut: Vacation['statut']) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useVacations(userId: string | null): UseVacationsResult {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vacationsRepository.getAll(userId);
      setVacations(data);
    } catch (e) {
      setError('Impossible de charger les vacations.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (data: VacationFormData): Promise<Vacation> => {
      if (!userId) throw new Error('Non authentifié');
      const created = await vacationsRepository.create(userId, data);
      setVacations((prev) => [created, ...prev]);
      return created;
    },
    [userId]
  );

  const updateStatut = useCallback(
    async (id: string, statut: Vacation['statut']): Promise<void> => {
      const updated = await vacationsRepository.updateStatut(id, statut);
      setVacations((prev) => prev.map((v) => (v.id === id ? updated : v)));
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    await vacationsRepository.delete(id);
    setVacations((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return { vacations, loading, error, refetch: fetch, create, updateStatut, remove };
}
