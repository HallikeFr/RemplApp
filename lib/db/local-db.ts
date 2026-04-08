import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Profile, Structure, Vacation } from '@/types';

// ============================================================
// Schéma IndexedDB pour le stockage offline
// ============================================================

interface RemplAppDB extends DBSchema {
  profiles: {
    key: string;
    value: Profile;
  };
  structures: {
    key: string;
    value: Structure;
    indexes: { 'by-user': string };
  };
  vacations: {
    key: string;
    value: Vacation;
    indexes: {
      'by-user': string;
      'by-structure': string;
      'by-date': string;
      'by-synced': number; // 0 = non syncé, 1 = syncé
    };
  };
}

const DB_NAME = 'remplapp';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<RemplAppDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<RemplAppDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<RemplAppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Profiles
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' });
      }

      // Structures
      if (!db.objectStoreNames.contains('structures')) {
        const structuresStore = db.createObjectStore('structures', {
          keyPath: 'id',
        });
        structuresStore.createIndex('by-user', 'user_id');
      }

      // Vacations
      if (!db.objectStoreNames.contains('vacations')) {
        const vacationsStore = db.createObjectStore('vacations', {
          keyPath: 'id',
        });
        vacationsStore.createIndex('by-user', 'user_id');
        vacationsStore.createIndex('by-structure', 'structure_id');
        vacationsStore.createIndex('by-date', 'date');
        vacationsStore.createIndex('by-synced', 'synced');
      }
    },
  });

  return dbInstance;
}

// Ferme la connexion (utile pour les tests)
export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
