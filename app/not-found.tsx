import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-subtle)] px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-[var(--color-primary)] mb-4">404</p>
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">Page introuvable</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
