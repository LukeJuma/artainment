import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PLACEHOLDER } from '../../lib/constants'

interface AuthShellProps {
  eyebrow: string
  title: string
  panelTitle: string
  panelCopy: string
  panelPoints: string[]
  switchPrompt: string
  switchLabel: string
  switchTo: string
  children: ReactNode
}

/**
 * Split-screen auth layout (brand panel + glass form), collapsing to a
 * single column on mobile.
 */
export function AuthShell({
  eyebrow,
  title,
  panelTitle,
  panelCopy,
  panelPoints,
  switchPrompt,
  switchLabel,
  switchTo,
  children,
}: AuthShellProps) {
  return (
    <div className="auth-shell" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 64 }}>
      {/* Brand panel */}
      <div className="auth-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <img src={PLACEHOLDER.hero} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,7,0.92) 0%, rgba(5,5,7,0.45) 55%, rgba(5,5,7,0.25) 100%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1, padding: 'clamp(28px, 5vw, 64px)', maxWidth: 520 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 28, height: 2, background: 'var(--ds-gold)' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              {eyebrow}
            </span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 0.95, color: '#fff', margin: '0 0 14px' }}>
            {panelTitle}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', margin: '0 0 20px' }}>
            {panelCopy}
          </p>
          <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {panelPoints.map(pt => (
              <li key={pt} style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-gold)', flexShrink: 0 }} />
                {pt}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{switchPrompt}</span>
            <Link
              to={switchTo}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                color: '#fff', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)',
                padding: '10px 22px', borderRadius: 'var(--ds-radius-pill)', transition: 'all 0.2s',
              }}
            >
              {switchLabel} →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Form side */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '48px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: 1, color: 'var(--text)', margin: '0 0 28px' }}>
            {title}
          </h1>
          {children}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .auth-shell { grid-template-columns: 1fr !important; }
          .auth-panel { min-height: 300px !important; }
        }
      `}</style>
    </div>
  )
}

export function AuthField({
  label,
  icon,
  children,
}: {
  label: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <label style={{ display: 'block', marginBottom: 20 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>
        {icon}
        {label}
      </span>
      <span style={{ display: 'block', borderBottom: '1.5px solid var(--border)', paddingBottom: 2, transition: 'border-color 0.2s' }}>
        {children}
      </span>
    </label>
  )
}

export const authInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  padding: '12px 2px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 16,
  color: 'var(--text)',
  boxSizing: 'border-box',
  minHeight: 44,
}

export function FieldIcon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d={d} />
    </svg>
  )
}

export const ICON_MAIL = 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6'
export const ICON_USER = 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
export const ICON_LOCK = 'M5 11h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z M8 11V7a4 4 0 0 1 8 0v4'
