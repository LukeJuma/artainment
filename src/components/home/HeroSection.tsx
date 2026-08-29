import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { type Film } from '../../lib/api'
import { IconPlay } from '../ui/Icons'

interface HeroSectionProps {
  films: Film[]
  featured: Film | null
}

export function HeroSection({ films, featured }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const pool = films.length ? films : (featured ? [featured] : [])

  const next = useCallback(() => {
    if (pool.length) setCurrent(i => (i + 1) % pool.length)
  }, [pool.length])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || paused) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [next, paused])

  const film = pool[current]
  if (!film) return <section style={{ height: '100vh', background: '#0d0d0f' }} />

  const isUpcoming = film?.status === 'upcoming'
  const hasArtwork = !!(film.backdrop_url || film.poster_url)

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', height: '100vh', minHeight: 500, overflow: 'hidden', background: '#0d0d0f' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {hasArtwork ? (
            <>
              {film?.poster_url && (
                <img
                  className="hero-art-poster"
                  src={film.poster_url}
                  alt={film?.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              )}
              <img
                className="hero-art-backdrop"
                src={film?.backdrop_url || film?.poster_url || ''}
                alt={film?.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </>
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(1100px 600px at 82% -10%, rgba(255,45,45,0.22), transparent 62%), radial-gradient(900px 520px at 8% 115%, rgba(255,45,45,0.14), transparent 60%), linear-gradient(160deg, #17151b 0%, #0d0d0f 55%, #0a0a0c 100%)',
            }} />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.72) 40%, rgba(8,8,10,0.25) 100%)',
          }} />
          <div className="hero-mobile-overlay" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.35) 45%, transparent 70%)',
          }} />
        </motion.div>
      </AnimatePresence>

      <div className="hero-content" style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 clamp(16px, 5vw, 80px)', paddingBottom: 'clamp(60px, 9vh, 96px)', paddingTop: 140,
        maxWidth: 700,
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            {film?.tag && (
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 4,
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                background: isUpcoming ? '#F59E0B' : 'var(--red)', color: '#fff', marginBottom: 12,
              }}>{isUpcoming ? 'Coming Soon' : film.tag}</span>
            )}
            <h1 className="section-heading" style={{
              color: '#fff', margin: '0 0 12px', fontFamily: 'Chonburi', fontWeight: 400,
              fontSize: 'clamp(36px, 8vw, 88px)', lineHeight: 0.95,
            }}>{film?.title || ''}</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {film?.genre && <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 1 }}>{film.genre}</span>}
              {film?.year && <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{film.year}</span>}
              {film?.duration && <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{film.duration}</span>}
              {film?.rating ? <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>{film.rating}</span> : null}
            </div>
            {film?.synopsis && (
              <p style={{ fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', marginBottom: 24, maxWidth: 480 }}>
                {film.synopsis.length > 150 ? film.synopsis.slice(0, 150) + '...' : film.synopsis}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to={`/films/${film?.slug || ''}`} className="btn-red">
                <IconPlay size={14} color="#fff" /> {isUpcoming ? 'Watch Trailer' : 'Watch Now'}
              </Link>
              <Link to="/films" className="btn-outline-light">Browse Movies</Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {pool.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 40 }}>
            {pool.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to film ${i + 1}`}
                style={{
                  width: i === current ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === current ? 'var(--red)' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.3s', minHeight: 8,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)' }} />
      </motion.div>
    </section>
  )
}
