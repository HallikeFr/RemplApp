'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

export function SyncBanner() {
  const { user } = useUser();
  const { online, syncCount } = useOnlineStatus(user?.id ?? null);
  const [showSynced, setShowSynced] = useState(false);

  // Affiche le message de sync réussi pendant 4s
  useEffect(() => {
    if (syncCount > 0) {
      setShowSynced(true);
      const t = setTimeout(() => setShowSynced(false), 4000);
      return () => clearTimeout(t);
    }
  }, [syncCount]);

  if (online && !showSynced) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-all ${
        !online
          ? 'bg-[var(--color-warning)] text-white'
          : 'bg-[var(--color-success)] text-white'
      }`}
    >
      {!online ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M3 3l18 18M9.879 9.879A3 3 0 0012 15a3 3 0 002.121-.879" />
          </svg>
          Mode hors ligne — les données seront synchronisées au retour en ligne
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {syncCount} vacation{syncCount > 1 ? 's' : ''} synchronisée{syncCount > 1 ? 's' : ''} avec succès
        </>
      )}
    </div>
  );
}
