'use client';

import { useState, useEffect, useCallback } from 'react';
import { profilesRepository } from '@/lib/repositories/profiles';
import type { Profile, ProfileFormData } from '@/types';

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  save: (data: ProfileFormData) => Promise<Profile>;
}

export function useProfile(userId: string | null): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    profilesRepository.get(userId).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [userId]);

  const save = useCallback(
    async (data: ProfileFormData): Promise<Profile> => {
      if (!userId) throw new Error('Non authentifié');
      const saved = await profilesRepository.upsert(userId, data);
      setProfile(saved);
      return saved;
    },
    [userId]
  );

  return { profile, loading, save };
}
