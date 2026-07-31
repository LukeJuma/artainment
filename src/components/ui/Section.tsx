import type { ReactNode } from 'react'

export function Section({ children, style = {}, className = '' }: { children: ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <section
      className={`section-pad ${className}`}
      style={{ padding: 'clamp(48px, 8vw, 100px) clamp(20px, 5vw, 80px)', ...style }}
    >
      {children}
    </section>
  )
}
