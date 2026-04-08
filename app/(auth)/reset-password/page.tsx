'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase envoie le token dans le hash (#access_token=...) ou query params
  useEffect(() => {
    const supabase = createClient();
    // Laisser Supabase traiter le hash de l'URL automatiquement
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError('Erreur lors de la réinitialisation. Le lien a peut-être expiré.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--color-text-muted)]">Vérification du lien...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
        Nouveau mot de passe
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Choisissez un mot de passe sécurisé.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full h-11 px-3.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            placeholder="8 caractères minimum"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Confirmer
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full h-11 px-3.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
