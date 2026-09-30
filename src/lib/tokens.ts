/**
 * Design-system tokens mirrored in TypeScript for inline-style usage.
 * Source of truth is `src/styles/tokens.css` — keep the two in sync.
 */

export const ds = {
  brand: 'var(--ds-brand)',
  brandHover: 'var(--ds-brand-hover)',
  brandGlow: 'var(--ds-brand-glow)',
  brandWash: 'var(--ds-brand-wash)',
  gold: 'var(--ds-gold)',
  goldGlow: 'var(--ds-gold-glow)',
  ink: {
    950: 'var(--ds-ink-950)',
    900: 'var(--ds-ink-900)',
    850: 'var(--ds-ink-850)',
    800: 'var(--ds-ink-800)',
    700: 'var(--ds-ink-700)',
  },
  line: 'var(--ds-line)',
  lineStrong: 'var(--ds-line-strong)',
  fog: {
    100: 'var(--ds-fog-100)',
    300: 'var(--ds-fog-300)',
    500: 'var(--ds-fog-500)',
    600: 'var(--ds-fog-600)',
  },
  font: {
    display: "'Chonburi', cursive",
    body: "'DM Sans', sans-serif",
    accent: "'Domine', serif",
  },
  radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeCinema: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  dur: { fast: 150, base: 250, slow: 500 },
} as const;

export type DsRadius = keyof typeof ds.radius;
