import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { filmsAPI, type Film } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Loader } from '../components/ui/Loader'
import { IconStar, IconPlay, IconClock } from '../components/ui/Icons'

export function FilmDetailPage() {
  const { slug } = useParams()
  const [film, setFilm] = useState<Film | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { if (!slug) return; filmsAPI.get(slug).then(setFilm).catch(() => setError(true)) }, [slug])

  if (error) return <div style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text)', fontFamily: 'Chonburi, cursive', fontSize: 24 }}>Film not found.</div>
  if (!film) return <Loader />

  return (
    <div style={{ paddingTop: 0 }}>
      <div className="film-backdrop" style={{ position: 'relative', height: 700, overflow: 'hidden' }}>
        <motion.img initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }}
          src={imgOr('film', film.backdrop_url)} alt={film.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 70%, transparent) 40%, color-mix(in srgb, var(--bg) 30%, transparent) 100%)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="film-backdrop-content" style={{ position: 'absolute', bottom: 24, left: 80, right: 80, zIndex: 2 }}>
          <SectionLabel text="The Artainment" />
          <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(36px, 6vw, 90px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.9, margin: '0 0 20px' }}>{film.title}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--red)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={12} color="var(--red)" /> {film.rating} / 10</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>{film.year}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>{film.genre}</span>
            {film.duration && <><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} /><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconClock size={12} color="var(--text-secondary)" /> {film.duration}</span></>}
          </div>
        </motion.div>
      </div>
      <Section>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            {film.synopsis && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, lineHeight: 1.9, color: 'var(--text-secondary)', margin: '0 0 48px' }}>{film.synopsis}</p>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
            style={{ background: 'var(--bg-muted)', borderRadius: 12, overflow: 'hidden', marginBottom: 48, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            {film.video_url ? (
              <video controls style={{ width: '100%', height: '100%' }} poster={imgOr('film', film.backdrop_url)}>
                <source src={film.video_url} type="video/mp4" />
              </video>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><IconPlay size={48} color="var(--text-muted)" /></div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>Streaming coming soon</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>Video will be available once uploaded by admin</p>
              </div>
            )}
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
