import type { CSSProperties, ReactNode } from 'react';

type BadgeVariant = 'brand' | 'gold' | 'live' | 'outline' | 'muted' | 'upcoming';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: CSSProperties;
}

const VARIANTS: Record<BadgeVariant, CSSProperties> = {
  brand: { background: 'var(--ds-brand)', color: '#fff' },
  gold: { background: 'var(--ds-gold)', color: '#1a1206' },
  live: { background: 'rgba(225,29,72,0.15)', color: 'var(--ds-live-fg)', border: '1px solid rgba(225,29,72,0.45)' },
  outline: { background: 'transparent', color: 'var(--ds-outline-fg)', border: '1px solid var(--ds-card-line)' },
  muted: { background: 'var(--ds-chip-bg)', color: 'var(--ds-chip-fg)' },
  upcoming: { background: '#F59E0B', color: '#1a1206' },
};

export function Badge({ children, variant = 'brand', className = '', style = {} }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 'var(--ds-radius-xs)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {variant === 'live' && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--ds-brand-500)',
            animation: 'ds-pulse-dot 1.6s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </span>
  );
}
