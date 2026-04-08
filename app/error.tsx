'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur globale:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-subtle)] px-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-danger-bg)] mb-4">
          <svg className="w-7 h-7 text-[var(--color-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Une erreur est survenue</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Un problème inattendu s'est produit. Réessayez ou rechargez la page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="h-10 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition"
          >
            Réessayer
          </button>
          <a
            href="/dashboard"
            className="h-10 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-subtle)] transition flex items-center"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
