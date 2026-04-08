import type { Profile, ProfileFormData } from '@/types';
import { getDB } from '@/lib/db/local-db';
import { createClient } from '@/lib/supabase/client';
import { calculerPartsFiscales } from '@/lib/fiscalite/parts-fiscales';

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function now(): string {
  return new Date().toISOString();
}

// ============================================================
// Local (IndexedDB)
// ============================================================

async function getLocal(userId: string): Promise<Profile | undefined> {
  const db = await getDB();
  return db.get('profiles', userId);
}

async function upsertLocal(profile: Profile): Promise<Profile> {
  const db = await getDB();
  await db.put('profiles', profile);
  return profile;
}

// ============================================================
// Supabase
// ============================================================

async function getSupabase(userId: string): Promise<Profile | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return undefined;
  return data as Profile;
}

async function upsertSupabase(userId: string, data: ProfileFormData & { nb_parts_fiscales: number }): Promise<Profile> {
  const supabase = createClient();
  const { data: upserted, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...data })
    .select()
    .single();
  if (error) throw error;
  return upserted as Profile;
}

// ============================================================
// API publique
// ============================================================

export const profilesRepository = {
  async get(userId: string): Promise<Profile | null> {
    if (isOnline()) {
      try {
        const remote = await getSupabase(userId);
        if (remote) {
          const db = await getDB();
          await db.put('profiles', remote);
          return remote;
        }
      } catch { /* fallback */ }
    }
    return (await getLocal(userId)) ?? null;
  },

  async upsert(userId: string, data: ProfileFormData): Promise<Profile> {
    // Calcul automatique des parts fiscales
    const nb_parts_fiscales = calculerPartsFiscales(data);
    const payload = { ...data, nb_parts_fiscales };

    if (isOnline()) {
      const saved = await upsertSupabase(userId, payload);
      await upsertLocal(saved);
      return saved;
    }

    // Offline : construire un profil local
    const existing = await getLocal(userId);
    const profile: Profile = {
      id: userId,
      created_at: existing?.created_at ?? now(),
      updated_at: now(),
      ...payload,
    };
    return upsertLocal(profile);
  },
};
