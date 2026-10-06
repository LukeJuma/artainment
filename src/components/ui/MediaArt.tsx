import type { CSSProperties } from 'react'
import { Film as FilmIcon, Mic as MicIcon, User as UserIcon } from 'lucide-react'
import { responsive, imgFallback, imgTransformOk } from '../../lib/images'

interface MediaArtProps {
  type: 'film' | 'series' | 'actor' | 'podcast'
  title: string
  src?: string | null
  alt?: string
  absolute?: boolean
  style?: CSSProperties
  /** Override the srcset `sizes` to match the rendered layout. */
  sizes?: string
  /** Above-the-fold art: eager load + high fetch priority. */
  eager?: boolean
}

const PALETTES: Record<MediaArtProps['type'], [string, string]> = {
  film: ['#1c1224', '#3a0d12'],
  series: ['#0f2231', '#12202f'],
  actor: ['#1d1420', '#2c1a2c'],
  podcast: ['#141b2d', '#2a1a3a'],
}

export function MediaArt({ type, title, src, alt, absolute = true, style, sizes, eager = false }: MediaArtProps) {
  const [c1, c2] = PALETTES[type]
  const initials = title
    .split(/\s+/)
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const icon = type === 'podcast' ? <MicIcon size={34} strokeWidth={1.5} /> : type === 'actor' ? <UserIcon size={34} strokeWidth={1.5} /> : <FilmIcon size={34} strokeWidth={1.5} />

  if (src) {
    const r = responsive(src, sizes ? { sizes } : undefined)
    return (
      <img
        {...r}
        alt={alt || title}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        onLoad={imgTransformOk}
        onError={e => imgFallback(e, src)}
        style={absolute
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }
          : { width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      />
    )
  }

  // Theme-aware fallback: follows the toggle via surface/text tokens,
  // with a whisper of the type hue so kinds stay distinguishable.
  return (
    <div
      style={absolute
        ? { position: 'absolute', inset: 0, overflow: 'hidden', ...style }
        : { width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, var(--ds-surface-2) 0%, var(--ds-surface) 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(120% 90% at 82% -10%, ${c1}55, transparent 55%), radial-gradient(110% 80% at 8% 110%, ${c2}55, transparent 55%)`,
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%, -50%)',
        width: '62%', height: '62%', borderRadius: '50%', border: '1px solid var(--ds-card-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--ds-chip-bg)',
        color: 'var(--ds-text-3)',
      }}>
        {icon}
      </div>
      <span style={{
        position: 'absolute', top: '12%', left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px, 4vw, 44px)',
        color: 'var(--ds-text-3)', opacity: 0.55, letterSpacing: '0.04em',
      }}>{initials}</span>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16% 12% 10%' }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, lineHeight: 1.25,
          color: 'var(--ds-text-2)', textAlign: 'center',
          overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
        }}>{title}</div>
      </div>
    </div>
  )
}
