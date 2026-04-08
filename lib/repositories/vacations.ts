import type { Vacation, VacationFormData } from '@/types';
import { getDB } from '@/lib/db/local-db';
import { createClient } from '@/lib/supabase/client';

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// ============================================================
// Local (IndexedDB)
// ============================================================

async function getAllLocal(userId: string): Promise<Vacation[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('vacations', 'by-user', userId);
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

async function getByIdLocal(id: string): Promise<Vacation | undefined> {
  const db = await getDB();
  return db.get('vacations', id);
}

async function createLocal(userId: string, data: VacationFormData): Promise<Vacation> {
  const db = await getDB();
  const vacation: Vacation = {
    id: uuid(),
    user_id: userId,
    statut: 'programmee',
    synced: false,
    created_at: now(),
    updated_at: now(),
    ...data,
  };
  await db.put('vacations', vacation);
  return vacation;
}

async function updateLocal(id: string, data: Partial<Vacation>): Promise<Vacation> {
  const db = await getDB();
  const existing = await db.get('vacations', id);
  if (!existing) throw new Error(`Vacation ${id} introuvable`);
  const updated: Vacation = { ...existing, ...data, updated_at: now() };
  await db.put('vacations', updated);
  return updated;
}

async function deleteLocal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('vacations', id);
}

async function getUnsyncedLocal(userId: string): Promise<Vacation[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('vacations', 'by-user', userId);
  return all.filter((v) => !v.synced);
}

// ============================================================
// Supabase
// ============================================================

async function getAllSupabase(userId: string): Promise<Vacation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vacations')
    .select('*, structure:structures(id, nom, type)')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Vacation[];
}

async function getByIdSupabase(id: string): Promise<Vacation | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vacations')
    .select('*, structure:structures(id, nom, type)')
    .eq('id', id)
    .single();
  if (error) return undefined;
  return data as Vacation;
}

async function createSupabase(userId: string, data: VacationFormData): Promise<Vacation> {
  const supabase = createClient();
  const { data: created, error } = await supabase
    .from('vacations')
    .insert({ user_id: userId, statut: 'programmee', synced: true, ...data })
    .select('*, structure:structures(id, nom, type)')
    .single();
  if (error) throw error;
  return created as Vacation;
}

async function updateSupabase(id: string, data: Partial<Vacation>): Promise<Vacation> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, user_id: _uid, created_at: _ca, structure: _s, ...patch } = data as Vacation;
  const { data: updated, error } = await supabase
    .from('vacations')
    .update(patch)
    .eq('id', id)
    .select('*, structure:structures(id, nom, type)')
    .single();
  if (error) throw error;
  return updated as Vacation;
}

async function deleteSupabase(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('vacations').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Sync offline → Supabase
// ============================================================

export async function syncOfflineVacations(userId: string): Promise<number> {
  const unsynced = await getUnsyncedLocal(userId);
  if (unsynced.length === 0) return 0;

  let synced = 0;
  for (const vacation of unsynced) {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { structure: _s, synced: _sync, ...payload } = vacation;
      const { error } = await supabase
        .from('vacations')
        .upsert({ ...payload, synced: true });
      if (!error) {
        await updateLocal(vacation.id, { synced: true });
        synced++;
      }
    } catch {
      // Continue sur les autres
    }
  }
  return synced;
}

// ============================================================
// API publique
// ============================================================

export const vacationsRepository = {
  async getAll(userId: string): Promise<Vacation[]> {
    if (isOnline()) {
      try {
        const data = await getAllSupabase(userId);
        // Mise en cache local
        const db = await getDB();
        for (const v of data) {
          await db.put('vacations', { ...v, synced: true });
        }
        return data;
      } catch {
        return getAllLocal(userId);
      }
    }
    return getAllLocal(userId);
  },

  async getById(id: string): Promise<Vacation | undefined> {
    if (isOnline()) {
      try {
        return await getByIdSupabase(id);
      } catch {
        return getByIdLocal(id);
      }
    }
    return getByIdLocal(id);
  },

  async create(userId: string, data: VacationFormData): Promise<Vacation> {
    if (isOnline()) {
      const created = await createSupabase(userId, data);
      const db = await getDB();
      await db.put('vacations', { ...created, synced: true });
      return created;
    }
    return createLocal(userId, data);
  },

  async update(id: string, data: Partial<Vacation>): Promise<Vacation> {
    if (isOnline()) {
      const updated = await updateSupabase(id, data);
      const db = await getDB();
      await db.put('vacations', { ...updated, synced: true });
      return updated;
    }
    return updateLocal(id, data);
  },

  async delete(id: string): Promise<void> {
    if (isOnline()) {
      await deleteSupabase(id);
    }
    await deleteLocal(id);
  },

  async updateStatut(id: string, statut: Vacation['statut']): Promise<Vacation> {
    return vacationsRepository.update(id, { statut });
  },
};
