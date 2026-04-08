'use client';

import { useState, useEffect } from 'react';
import { syncOfflineVacations } from '@/lib/repositories/vacations';

export function useOnlineStatus(userId: string | null) {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      if (userId) {
        const count = await syncOfflineVacations(userId);
        if (count > 0) setSyncCount(count);
      }
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  return { online, syncCount };
}
