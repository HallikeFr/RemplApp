'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // On affiche toujours le succès (ne pas révéler si l'email existe)
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-success-bg)] mb-4">
          <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          Email envoyé
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.
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
        Mot de passe oublié
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Saisissez votre email pour recevoir un lien de réinitialisation.
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
            className="w-full h-11 px-3.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            placeholder="votre@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
        <Link href="/login" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
