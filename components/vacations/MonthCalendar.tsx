'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Vacation } from '@/types';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  vacations: Vacation[];
}

const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

const STATUT_COLORS: Record<string, string> = {
  programmee: 'bg-[var(--color-text-light)]',
  realisee: 'bg-[var(--color-warning)]',
  payee: 'bg-[var(--color-success)]',
};

export function MonthCalendar({ year, month, vacations }: MonthCalendarProps) {
  const { days, firstDayOffset } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Lundi = 0 pour l'affichage FR
    const rawDay = new Date(year, month, 1).getDay();
    const offset = rawDay === 0 ? 6 : rawDay - 1;
    return { days: daysInMonth, firstDayOffset: offset };
  }, [year, month]);

  // Index des vacations par date
  const vacByDate = useMemo(() => {
    const map: Record<string, Vacation[]> = {};
    for (const v of vacations) {
      const d = v.date; // YYYY-MM-DD
      if (!map[d]) map[d] = [];
      map[d].push(v);
    }
    return map;
  }, [vacations]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const cells: Array<number | null> = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* En-têtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {JOURS.map((j) => (
          <div key={j} className="text-center text-xs font-medium text-[var(--color-text-muted)] py-1">
            {j}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayVacations = vacByDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-lg flex flex-col items-center justify-start pt-1 relative ${
                isToday
                  ? 'bg-[#E8F0EC] font-bold'
                  : dayVacations.length > 0
                  ? 'bg-[var(--color-bg-subtle)]'
                  : ''
              }`}
            >
              <span
                className={`text-xs leading-none ${
                  isToday
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {day}
              </span>
              {/* Dots vacations */}
              {dayVacations.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5">
                  {dayVacations.slice(0, 3).map((v) => (
                    <Link key={v.id} href={`/vacations/${v.id}`}>
                      <span
                        className={`block w-1.5 h-1.5 rounded-full ${STATUT_COLORS[v.statut]}`}
                        title={v.structure?.nom}
                      />
                    </Link>
                  ))}
                  {dayVacations.length > 3 && (
                    <span className="text-[9px] text-[var(--color-text-light)]">+{dayVacations.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[
          { color: STATUT_COLORS.programmee, label: 'Programmée' },
          { color: STATUT_COLORS.realisee, label: 'Réalisée' },
          { color: STATUT_COLORS.payee, label: 'Payée' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
