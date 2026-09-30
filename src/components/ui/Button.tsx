import type { CSSProperties, ReactNode, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'light';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

const SIZES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '8px 18px', fontSize: 11, minHeight: 34 },
  md: { padding: '12px 28px', fontSize: 13, minHeight: 44 },
  lg: { padding: '15px 36px', fontSize: 14, minHeight: 52 },
};

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--ds-brand)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--ds-shadow-glow-brand)',
  },
  gold: {
    background: 'var(--ds-gold)',
    color: '#1a1206',
    border: '1px solid transparent',
    boxShadow: 'var(--ds-shadow-glow-gold)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--ds-outline-fg)',
    border: '1.5px solid var(--ds-card-line)',
  },
  ghost: {
    background: 'var(--ds-brand-wash)',
    color: 'var(--ds-brand-400)',
    border: '1px solid transparent',
  },
  light: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1.5px solid rgba(255,255,255,0.35)',
    backdropFilter: 'blur(8px)',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  style = {},
  ariaLabel,
}: ButtonProps) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    borderRadius: 'var(--ds-radius-pill)',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `all var(--ds-dur-fast) var(--ds-ease-out)`,
    ...SIZES[size],
    ...VARIANTS[variant],
    ...style,
  };

  if (to) {
    return (
      <Link to={to} className={className} style={base} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={className} style={base} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={base}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
