import type { CSSProperties } from 'react'
import { Film as FilmIcon, Mic as MicIcon, User as UserIcon } from 'lucide-react'

interface MediaArtProps {
  type: 'film' | 'series' | 'actor' | 'podcast'
  title: string
  src?: string | null
  alt?: string
  absolute?: boolean
  style?: CSSProperties
}

const PALETTES: Record<MediaArtProps['type'], [string, string]> = {
  film: ['#1c1224', '#3a0d12'],
  series: ['#0f2231', '#12202f'],
  actor: ['#1d1420', '#2c1a2c'],
  podcast: ['#141b2d', '#2a1a3a'],
}

export function MediaArt({ type, title, src, alt, absolute = true, style }: MediaArtProps) {
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
    return (
      <img
        src={src}
        alt={alt || title}
        loading="lazy"
        style={absolute
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }
          : { width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      />
    )
  }

  return (
    <div
      style={absolute
        ? { position: 'absolute', inset: 0, overflow: 'hidden', ...style }
        : { width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${c1} 0%, ${c2} 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 90% at 82% -10%, rgba(255,255,255,0.14), transparent 55%), radial-gradient(110% 80% at 8% 110%, rgba(255,255,255,0.08), transparent 55%)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%, -50%)',
        width: '62%', height: '62%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)',
        color: 'rgba(255,255,255,0.55)',
      }}>
        {icon}
      </div>
      <span style={{
        position: 'absolute', top: '12%', left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Chonburi', cursive", fontSize: 'clamp(26px, 4vw, 44px)',
        color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em',
      }}>{initials}</span>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16% 12% 10%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
      }}>
        <div style={{
          fontFamily: "'Chonburi', cursive", fontSize: 13, lineHeight: 1.25,
          color: 'rgba(255,255,255,0.85)', textAlign: 'center',
          overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
        }}>{title}</div>
      </div>
    </div>
  )
}
