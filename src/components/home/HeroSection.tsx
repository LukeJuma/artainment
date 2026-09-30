import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Film, type Series } from '../../lib/api'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { IconPlay, IconStar } from '../ui/Icons'

export interface HeroItem {
  kind: 'film' | 'series'
  slug: string
  title: string
  genre?: string | null
  year?: string | null
  duration?: string | null
  rating?: number | null
  synopsis?: string | null
  tag?: string | null
  status?: string | null
  poster_url?: string | null
  backdrop_url?: string | null
}

interface HeroSectionProps {
  films: Film[]
  series?: Series[]
  featured: Film | Series | null
  featuredKind?: 'film' | 'series'
}

function toHeroItem(kind: 'film' | 'series', f: Film | Series): HeroItem {
  return {
    kind,
    slug: f.slug,
    title: f.title,
    genre: f.genre,
    year: f.year,
    duration: (f as Film).duration ?? null,
    rating: f.rating,
    synopsis: f.synopsis,
    tag: f.tag,
    status: f.status,
    poster_url: f.poster_url,
    backdrop_url: f.backdrop_url,
  }
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(Math.min(Math.max(rating, 0), 10) / 2)
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} aria-label={`Rated ${rating} out of 10`}>
      {[1, 2, 3, 4, 5].map(i => (
        <IconStar key={i} size={13} color={i <= filled ? 'var(--ds-gold)' : 'rgba(255,255,255,0.25)'} filled={i <= filled} />
      ))}
    </span>
  )
}

export function HeroSection({ films, series = [], featured, featuredKind = 'film' }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const items: HeroItem[] = [
    ...series.map(s => toHeroItem('series', s)),
    ...films.map(f => toHeroItem('film', f)),
  ]
  const pool: HeroItem[] = items.length
    ? items
    : (featured ? [toHeroItem(featuredKind, featured)] : [])

  const next = useCallback(() => {
    if (pool.length) setCurrent(i => (i + 1) % pool.length)
  }, [pool.length])

  useEffect(() => {
    setCurrent(0)
  }, [pool.length])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || paused) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [next, paused])

  const film = pool[current]
  if (!film) return <section style={{ height: '100vh', background: 'var(--ds-ink-950)' }} />

  const isUpcoming = film?.status === 'upcoming'
  const art = film?.backdrop_url || film?.poster_url || ''
  const detailPath = `/${film?.kind === 'series' ? 'series' : 'films'}/${film?.slug || ''}`

  // Coverflow geometry: the active slide rises toward the viewer while
  // neighbours recede, shrink and tilt — depth instead of a flat strip.
  const coverStyle = (index: number): CSSProperties => {
    const offset = index - current
    const abs = Math.abs(offset)
    const dir = offset === 0 ? 0 : offset > 0 ? 1 : -1
    if (abs === 0) {
      return {
        transform: 'translateY(-16px) scale(1.22)',
        opacity: 1, zIndex: 10,
        border: '2px solid var(--ds-brand)',
        boxShadow: 'var(--ds-shadow-glow-brand)',
      }
    }
    if (abs === 1) {
      return {
        transform: `translateY(-4px) scale(1) rotateY(${-dir * 10}deg)`,
        opacity: 0.85, zIndex: 5,
        border: '1px solid rgba(255,255,255,0.35)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
      }
    }
    if (abs === 2) {
      return {
        transform: `translateY(8px) scale(0.86) rotateY(${-dir * 18}deg)`,
        opacity: 0.55, zIndex: 1,
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: 'none',
      }
    }
    return {
      transform: 'translateY(12px) scale(0.72)',
      opacity: 0.3, zIndex: 0,
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: 'none',
    }
  }

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', height: '100vh', minHeight: 560, overflow: 'hidden', background: 'var(--ds-ink-950)' }}
    >
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {art ? (
            <img src={art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1100px 600px at 82% -10%, rgba(225,29,72,0.22), transparent 62%), linear-gradient(160deg, #17151b 0%, #0d0d0f 55%, #0a0a0c 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-left)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)', opacity: 0.85 }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 clamp(20px, 5vw, 80px)', paddingBottom: 'clamp(120px, 18vh, 170px)', paddingTop: 140,
        maxWidth: 760,
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {film?.kind === 'series' ? <Badge variant="brand">Series</Badge> : <Badge variant="brand">Film</Badge>}
              {isUpcoming ? <Badge variant="upcoming">Coming Soon</Badge> : (film?.tag ? <Badge variant="muted">{film.tag}</Badge> : null)}
            </div>
            <h1 style={{
              color: '#fff', margin: '0 0 12px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400,
              fontSize: 'clamp(38px, 7vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.01em',
            }}>{film?.title || ''}</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {typeof film?.rating === 'number' && <Stars rating={film.rating} />}
              {typeof film?.rating === 'number' && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--ds-gold)', fontWeight: 700 }}>
                  {film.rating.toFixed(1)}
                </span>
              )}
              {film?.year && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 1 }}>{film.year}</span>}
              {film?.genre && (
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--ds-radius-pill)',
                  padding: '3px 12px', letterSpacing: 0.5,
                }}>{film.genre}</span>
              )}
              {film?.duration && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{film.duration}</span>}
            </div>
            {film?.synopsis && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: '0 0 24px', maxWidth: 480 }}>
                {film.synopsis.length > 150 ? film.synopsis.slice(0, 150) + '...' : film.synopsis}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button to={detailPath} variant="primary">
                <IconPlay size={14} color="#fff" /> {isUpcoming ? 'Watch Trailer' : 'Watch Now'}
              </Button>
              <Button to={detailPath} variant="light">Details</Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Coverflow selector: active slide rises, neighbours recede */}
      {pool.length > 1 && (
        <div style={{
          position: 'absolute', zIndex: 3, left: 0, right: 0, bottom: 0,
          padding: '30px clamp(20px, 5vw, 80px) 26px',
          display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none',
          alignItems: 'flex-end',
          perspective: 1100,
          maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
        }}>
          {pool.map((item, i) => {
            const thumb = item.poster_url || item.backdrop_url
            const active = i === current
            return (
              <button
                key={`${item.kind}-${item.slug}`}
                onClick={() => setCurrent(i)}
                aria-label={`Show ${item.title}`}
                title={item.title}
                style={{
                  flexShrink: 0, width: 104, height: 64, borderRadius: 'var(--ds-radius-sm)', overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer', padding: 0, background: 'var(--ds-surface-2)',
                  transition: 'transform 0.5s var(--ds-ease-cinema), opacity 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease',
                  ...coverStyle(i),
                }}
              >
                {thumb ? (
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--ds-text-3)', padding: 4, display: 'block' }}>{item.title}</span>
                )}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: 4, left: 6, right: 6, overflow: 'hidden',
                    whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700,
                    color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                  }}>{item.title}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
