type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent-light)] text-[#7A5F1A]',
  primary: 'bg-[#E8F0EC] text-[var(--color-primary)]',
};

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Correspondance statut vacation → variant badge
export function StatutBadge({ statut }: { statut: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    programmee: { label: 'Programmée', variant: 'default' },
    realisee: { label: 'Réalisée', variant: 'warning' },
    payee: { label: 'Payée', variant: 'success' },
  };
  const { label, variant } = config[statut] ?? { label: statut, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}
