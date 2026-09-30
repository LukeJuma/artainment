import type { CSSProperties, ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'auto';
  className?: string;
  style?: CSSProperties;
}

/**
 * Cinematic section header: red tick + tracked eyebrow, Chonburi display
 * title, muted sub-copy. Replaces ad-hoc SectionLabel + h2 combinations.
 */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'left',
  tone = 'dark',
  className = '',
  style = {},
}: SectionHeadingProps) {
  const onDark = tone === 'dark';
  const centered = align === 'center';

  return (
    <div
      className={className}
      style={{ textAlign: centered ? 'center' : 'left', marginBottom: 32, ...style }}
    >
      {eyebrow && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
            justifyContent: centered ? 'center' : 'flex-start',
          }}
        >
          <span style={{ width: 28, height: 2, background: 'var(--ds-brand)' }} />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'var(--ds-eyebrow-size)',
              letterSpacing: 'var(--ds-eyebrow-tracking)',
              color: 'var(--ds-brand-400)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </span>
          {centered && <span style={{ width: 28, height: 2, background: 'var(--ds-brand)' }} />}
        </div>
      )}
      <h2
        style={{
          fontFamily: "'Chonburi', cursive",
          fontWeight: 400,
          fontSize: 'var(--ds-display-lg)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          color: onDark ? 'var(--ds-fog-100)' : 'var(--text)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            lineHeight: 1.7,
            color: onDark ? 'var(--ds-fog-500)' : 'var(--text-secondary)',
            margin: '14px 0 0',
            maxWidth: centered ? 560 : 520,
            marginLeft: centered ? 'auto' : undefined,
            marginRight: centered ? 'auto' : undefined,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
