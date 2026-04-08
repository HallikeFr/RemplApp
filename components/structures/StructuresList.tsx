'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStructures } from '@/lib/hooks/useStructures';
import { useUser } from '@/lib/hooks/useUser';
import { StructureCard } from './StructureCard';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export function StructuresList() {
  const { user } = useUser();
  const { structures, loading, error } = useStructures(user?.id ?? null);
  const [search, setSearch] = useState('');

  const filtered = structures.filter((s) =>
    s.nom.toLowerCase().includes(search.toLowerCase()) ||
    (s.adresse ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Structures"
        subtitle="Cabinets, cliniques et centres d'imagerie"
        action={
          <Link href="/structures/new">
            <Button size="sm">+ Ajouter</Button>
          </Link>
        }
      />

      <div className="px-4 md:px-6 space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une structure..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* États */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-bg-subtle)] mb-4">
              <svg className="w-7 h-7 text-[var(--color-text-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {search ? (
              <p className="text-[var(--color-text-muted)] text-sm">Aucune structure ne correspond à "{search}"</p>
            ) : (
              <>
                <p className="font-medium text-[var(--color-text)] mb-1">Aucune structure</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  Ajoutez vos cabinets et cliniques partenaires.
                </p>
                <Link href="/structures/new">
                  <Button variant="primary">Ajouter une structure</Button>
                </Link>
              </>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((structure) => (
              <StructureCard key={structure.id} structure={structure} />
            ))}
            <p className="text-xs text-[var(--color-text-light)] text-center pb-2">
              {filtered.length} structure{filtered.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
