import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { filmsAPI, type Film } from '../../lib/api'
import { useTheme } from '../../contexts/ThemeContext'
import { IconPlay } from '../ui/Icons'

export function HeroSection() {
  const [films, setFilms] = useState<Film[]>([])
  const [current, setCurrent] = useState(0)
  const { theme } = useTheme()

  useEffect(() => { filmsAPI.list().then(setFilms).catch(() => {}) }, [])

  const next = useCallback(() => {
    if (films.length) setCurrent(i => (i + 1) % films.length)
  }, [films.length])

  useEffect(() => {
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [next])

  const film = films[current]
  if (!films.length) return <section style={{ height: '100vh', background: theme === 'dark' ? '#0f0f0f' : '#fff' }} />

  const isUpcoming = film?.status === 'upcoming'

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 500, overflow: 'hidden', background: theme === 'dark' ? '#0f0f0f' : '#fff' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <img
            src={film?.backdrop_url || film?.poster_url || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=900&fit=crop&auto=format'}
            alt={film?.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: theme === 'dark'
              ? 'linear-gradient(to right, rgba(15,15,15,0.92) 0%, rgba(15,15,15,0.7) 40%, transparent 70%)'
              : 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 40%, transparent 70%)',
          }} />
          <div className="hero-mobile-overlay" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
            display: 'none',
          }} />
        </motion.div>
      </AnimatePresence>

      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 clamp(16px, 5vw, 80px)', maxWidth: 700,
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
              color: 'var(--text)', margin: '0 0 12px',
              fontSize: 'clamp(36px, 8vw, 88px)', lineHeight: 0.95,
            }}>{film?.title || ''}</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {film?.genre && <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{film.genre}</span>}
              {film?.year && <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>{film.year}</span>}
              {film?.duration && <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>{film.duration}</span>}
              {film?.rating ? <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>{film.rating}</span> : null}
            </div>
            {film?.synopsis && (
              <p style={{ fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 480 }}>
                {film.synopsis.length > 150 ? film.synopsis.slice(0, 150) + '...' : film.synopsis}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to={`/films/${film?.slug || ''}`} className="btn-red">
                <IconPlay size={14} color="#fff" /> {isUpcoming ? 'Watch Trailer' : 'Watch Now'}
              </Link>
              <Link to="/films" className="btn-outline">Browse Films</Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 6, marginTop: 40 }}>
          {films.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === current ? 'var(--red)' : 'var(--border)',
                transition: 'all 0.3s', minHeight: 8,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ width: 1, height: 24, background: `linear-gradient(to bottom, var(--text-muted), transparent)` }} />
      </motion.div>
    </section>
  )
}
