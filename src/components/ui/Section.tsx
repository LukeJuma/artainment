import type { ReactNode } from 'react'

export function Section({ children, style = {}, dark = true }: { children: ReactNode; style?: React.CSSProperties; dark?: boolean }) {
  return (
    <section
      className="section"
      style={{ padding: '120px 80px', background: dark ? '#29282C' : '#1E1D21', ...style }}
    >
      {children}
    </section>
  )
}
