import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { filmsAPI, type Film } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

const genres = ['All', 'Drama', 'Thriller', 'Romance', 'Documentary', 'Sci-Fi']

export function FilmsPage() {
  const [films, setFilms] = useState<Film[]>([])
  const [filter, setFilter] = useState('All')
  useEffect(() => { filmsAPI.list(filter === 'All' ? undefined : filter).then(setFilms).catch(() => {}) }, [filter])

  return (
    <div style={{ paddingTop: 100 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="The Artainment" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: '#fff', lineHeight: 0.95, margin: '0 0 48px' }}>Our Films</h1>
          <div style={{ display: 'flex', gap: 10, marginBottom: 56, flexWrap: 'wrap' }}>
            {genres.map(g => (
              <button key={g} onClick={() => setFilter(g)}
                style={{ background: filter === g ? '#F00000' : 'transparent', border: `1px solid ${filter === g ? '#F00000' : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: filter === g ? '#fff' : 'rgba(255,255,255,0.5)', padding: '10px 22px', borderRadius: 6, transition: 'all 0.2s', fontWeight: 500 }}>{g}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {films.map((film, i) => (
              <motion.div key={film.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/films/${film.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', paddingBottom: '145%', borderRadius: 6, overflow: 'hidden', marginBottom: 14, background: '#2d2c30' }}>
                    <img src={imgOr('film', film.poster_url, i)} alt={film.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    {film.tag && <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: 1.5, background: '#F00000', color: '#fff', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 700 }}>{film.tag}</span>}
                  </div>
                  <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{film.title}</h3>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{film.year} · {film.genre}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#F7BB0E', marginLeft: 'auto', fontWeight: 600 }}>★ {film.rating}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
