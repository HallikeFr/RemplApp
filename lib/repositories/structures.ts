import type { Structure, StructureFormData } from '@/types';
import { getDB } from '@/lib/db/local-db';
import { createClient } from '@/lib/supabase/client';

// Génère un UUID v4 côté client (pour le stockage local offline)
function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ============================================================
// CRUD local (IndexedDB)
// ============================================================

async function getAllLocal(userId: string): Promise<Structure[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('structures', 'by-user', userId);
  return all.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

async function getByIdLocal(id: string): Promise<Structure | undefined> {
  const db = await getDB();
  return db.get('structures', id);
}

async function createLocal(userId: string, data: StructureFormData): Promise<Structure> {
  const db = await getDB();
  const structure: Structure = {
    id: uuid(),
    user_id: userId,
    created_at: now(),
    updated_at: now(),
    ...data,
  };
  await db.put('structures', structure);
  return structure;
}

async function updateLocal(id: string, data: Partial<StructureFormData>): Promise<Structure> {
  const db = await getDB();
  const existing = await db.get('structures', id);
  if (!existing) throw new Error(`Structure ${id} introuvable`);
  const updated: Structure = { ...existing, ...data, updated_at: now() };
  await db.put('structures', updated);
  return updated;
}

async function deleteLocal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('structures', id);
}

// ============================================================
// CRUD Supabase
// ============================================================

async function getAllSupabase(userId: string): Promise<Structure[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('structures')
    .select('*')
    .eq('user_id', userId)
    .order('nom', { ascending: true });
  if (error) throw error;
  return data as Structure[];
}

async function getByIdSupabase(id: string): Promise<Structure | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('structures')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return undefined;
  return data as Structure;
}

async function createSupabase(userId: string, data: StructureFormData): Promise<Structure> {
  const supabase = createClient();
  const { data: created, error } = await supabase
    .from('structures')
    .insert({ user_id: userId, ...data })
    .select()
    .single();
  if (error) throw error;
  return created as Structure;
}

async function updateSupabase(id: string, data: Partial<StructureFormData>): Promise<Structure> {
  const supabase = createClient();
  const { data: updated, error } = await supabase
    .from('structures')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Structure;
}

async function deleteSupabase(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('structures').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// API publique — choisit automatiquement local ou Supabase
// ============================================================

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export const structuresRepository = {
  async getAll(userId: string): Promise<Structure[]> {
    if (isOnline()) {
      try {
        return await getAllSupabase(userId);
      } catch {
        return getAllLocal(userId);
      }
    }
    return getAllLocal(userId);
  },

  async getById(id: string): Promise<Structure | undefined> {
    if (isOnline()) {
      try {
        return await getByIdSupabase(id);
      } catch {
        return getByIdLocal(id);
      }
    }
    return getByIdLocal(id);
  },

  async create(userId: string, data: StructureFormData): Promise<Structure> {
    if (isOnline()) {
      const created = await createSupabase(userId, data);
      // Mise en cache local
      const db = await getDB();
      await db.put('structures', created);
      return created;
    }
    return createLocal(userId, data);
  },

  async update(id: string, data: Partial<StructureFormData>): Promise<Structure> {
    if (isOnline()) {
      const updated = await updateSupabase(id, data);
      const db = await getDB();
      await db.put('structures', updated);
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
};
