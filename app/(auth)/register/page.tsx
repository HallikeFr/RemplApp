'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError("Erreur lors de l'inscription. Cet email est peut-être déjà utilisé.");
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-success-bg)] mb-4">
          <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          Vérifiez votre email
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Un email de confirmation a été envoyé à{' '}
          <strong className="text-[var(--color-text)]">{email}</strong>.<br />
          Cliquez sur le lien pour activer votre compte.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 text-sm text-[var(--color-primary)] font-medium hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
        Créer un compte
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Gratuit, confidentiel, usage personnel.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full h-11 px-3.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Mot de passe
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
            Confirmer le mot de passe
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

        <p className="text-xs text-[var(--color-text-muted)]">
          En créant un compte, vous acceptez que vos données soient stockées de manière sécurisée et confidentielle (RGPD). Vous pouvez demander la suppression de votre compte à tout moment.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
