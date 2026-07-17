import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { filmsAPI, type Film } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Loader } from '../components/ui/Loader'

export function FilmDetailPage() {
  const { slug } = useParams()
  const [film, setFilm] = useState<Film | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { if (!slug) return; filmsAPI.get(slug).then(setFilm).catch(() => setError(true)) }, [slug])

  if (error) return <div style={{ paddingTop: 120, textAlign: 'center', color: '#fff', fontFamily: 'Clash Display, sans-serif', fontSize: 24 }}>Film not found.</div>
  if (!film) return <Loader />

  return (
    <div style={{ paddingTop: 0 }}>
      <div className="film-backdrop" style={{ position: 'relative', height: 700, overflow: 'hidden' }}>
        <img src={imgOr('film', film.backdrop_url)} alt={film.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #29282C 0%, rgba(41,40,44,0.7) 40%, rgba(41,40,44,0.3) 100%)' }} />
        <div className="film-backdrop-content" style={{ position: 'absolute', bottom: 60, left: 80, right: 80, zIndex: 2 }}>
          <SectionLabel text="The Artainment" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(48px, 7vw, 90px)', fontWeight: 700, color: '#fff', lineHeight: 0.9, margin: '0 0 20px' }}>{film.title}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#F7BB0E', fontWeight: 600 }}>★ {film.rating} / 10</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{film.year}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{film.genre}</span>
            {film.duration && <><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} /><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{film.duration}</span></>}
          </div>
        </div>
      </div>
      <Section>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {film.synopsis && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, lineHeight: 1.9, color: 'rgba(255,255,255,0.7)', margin: '0 0 48px' }}>{film.synopsis}</p>}
          <div style={{ background: '#1A191C', borderRadius: 12, overflow: 'hidden', marginBottom: 48, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            {film.video_url ? (
              <video controls style={{ width: '100%', height: '100%' }} poster={imgOr('film', film.backdrop_url)}>
                <source src={film.video_url} type="video/mp4" />
              </video>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>▶</div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Streaming coming soon</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Video will be available once uploaded by admin</p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}
