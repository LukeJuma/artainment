import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { IconChevronRight } from './Icons'

export interface Crumb {
  label: string
  to?: string
}

/**
 * Compact breadcrumb trail. On photographic heroes pass tone="light";
 * everywhere else the default follows the theme.
 */
export function Breadcrumbs({ items, tone = 'auto' }: { items: Crumb[]; tone?: 'auto' | 'light' }) {
  const light = tone === 'light'
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {items.map((item, i) => {
        const last = i === items.length - 1
        const color = last
          ? (light ? '#fff' : 'var(--text)')
          : (light ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)')
        return (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && <IconChevronRight size={12} color={light ? 'rgba(255,255,255,0.35)' : 'var(--text-muted)'} />}
            {item.to && !last ? (
              <Link
                to={item.to}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1.5,
                  textTransform: 'uppercase', color, textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1.5,
                textTransform: 'uppercase', color, fontWeight: last ? 700 : 400,
              }}>
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
