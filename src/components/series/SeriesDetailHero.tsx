import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Series } from '../../lib/api'
import { IconPlay, IconStar } from '../ui/Icons'
import { MediaArt } from '../ui/MediaArt'

interface SeriesDetailHeroProps {
  series: Series
  onStart: () => void
  startable: boolean
}

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export function SeriesDetailHero({ series, onStart, startable }: SeriesDetailHeroProps) {
  const reduced = useReducedMotion()
  const artwork = series.backdrop_url || series.poster_url

  const seasonCount = series.seasons?.length ?? series.seasons_count ?? 0
  const episodeCount = series.seasons?.reduce((n, s) => n + (s.episodes?.length || 0), 0) ?? series.episodes_count ?? 0

  const rise = (delay: number) => reduced
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE } }

  return (
    <header
      className="film-hero"
      style={{ position: 'relative', overflow: 'hidden', background: '#0a0a0c', minHeight: 'clamp(560px, 78vh, 720px)' }}
    >
      {/* ─── Cinematic backdrop ─────────────────────────── */}
      <div className="film-hero-backdrop" style={{ position: 'absolute', inset: 0 }}>
        {series.poster_url && (
          <motion.img
            className="hero-art-poster"
            src={series.poster_url}
            alt=""
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.08 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 1.4, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
        )}
        {artwork && (
          <motion.img
            className="hero-art-backdrop"
            src={artwork}
            alt=""
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.08 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 1.4, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
          />
        )}
        <div className="film-hero-shade-lr" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(8,8,10,0.97) 0%, rgba(8,8,10,0.84) 34%, rgba(8,8,10,0.35) 64%, rgba(8,8,10,0.55) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 72% 84% at 28% 46%, rgba(0,0,0,0.6), transparent 72%)',
        }} />
        <div className="film-hero-fade" style={{
          position: 'absolute', inset: 'auto 0 0 0', height: 'clamp(90px, 14vh, 170px)',
          background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
        }} />
      </div>

      {/* ─── Hero content ─────────────────────────────── */}
      <div className="film-hero-inner" style={{
        position: 'relative', maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(120px, 17vh, 180px) 32px clamp(56px, 8vh, 96px)',
        display: 'flex', alignItems: 'center', gap: 'clamp(28px, 5vw, 64px)',
      }}>
        <motion.div className="film-hero-poster" {...rise(0.1)} style={{ flexShrink: 0, position: 'relative' }}>
          <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 28px 70px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.4)' }}>
            <MediaArt type="series" title={series.title} src={series.poster_url} alt={`${series.title} poster`} />
          </div>
        </motion.div>

        <div className="film-hero-info" style={{ minWidth: 0, flex: 1 }}>
          <motion.div {...rise(0.15)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 32, height: 2, background: 'var(--red)' }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 4, color: '#fff', textTransform: 'uppercase', fontWeight: 600 }}>Original Series</span>
          </motion.div>

          <motion.h2 {...rise(0.2)} className="film-hero-title" style={{
            fontFamily: 'Chonburi, cursive', fontSize: 'clamp(40px, 7vw, 104px)', lineHeight: 0.95,
            color: '#fff', fontWeight: 700, margin: '0 0 22px', letterSpacing: '0.01em',
            textShadow: '0 4px 34px rgba(0,0,0,0.55)',
          }}>
            {series.title}
          </motion.h2>

          <motion.div {...rise(0.28)} className="film-hero-meta" style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, rowGap: 8, marginBottom: 24,
            color: 'rgba(255,255,255,0.9)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#ffd166', fontWeight: 700 }}>
              <IconStar size={14} color="#ffd166" /> {series.rating}/10
            </span>
            {series.year && <MetaDot />}
            {series.year && <span>{series.year}</span>}
            {series.genre && <><MetaDot /><span>{series.genre}</span></>}
            {seasonCount > 0 && <><MetaDot /><span>{seasonCount} season{seasonCount > 1 ? 's' : ''}</span></>}
            {episodeCount > 0 && <><MetaDot /><span>{episodeCount} episodes</span></>}
            {series.tag && (
              <>
                <MetaDot />
                <span style={{
                  textTransform: 'uppercase', letterSpacing: 1, fontSize: 12, fontWeight: 600,
                  background: 'rgba(239,68,68,0.16)', border: '1px solid rgba(239,68,68,0.45)',
                  color: '#ff9a8b', padding: '3px 11px', borderRadius: 4,
                }}>{series.tag}</span>
              </>
            )}
          </motion.div>

          {series.synopsis && (
            <motion.p {...rise(0.36)} className="film-hero-synopsis" style={{
              maxWidth: 580, fontFamily: 'DM Sans, sans-serif', fontSize: 17, lineHeight: 1.75,
              color: 'rgba(255,255,255,0.82)', margin: '0 0 34px',
              overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
              {series.synopsis}
            </motion.p>
          )}

          <motion.div {...rise(0.44)} className="film-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {startable && (
              <button
                onClick={onStart}
                className="btn-red"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 30px' }}
              >
                <IconPlay size={18} color="#fff" /> Start Watching
              </button>
            )}
            <Link to="/series" className="btn-outline-light" style={{ minHeight: 52, padding: '0 30px' }}>
              Browse Series
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

function MetaDot() {
  return <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
}
