import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { filmsAPI, type Film } from '../lib/api'
import { imgOr } from '../lib/utils'
import { stagger, fadeUp, useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { IconStar } from '../components/ui/Icons'

const genres = ['All', 'Drama', 'Thriller', 'Romance', 'Documentary', 'Sci-Fi']

export function FilmsPage() {
  const [films, setFilms] = useState<Film[]>([])
  const [filter, setFilter] = useState('All')
  const { ref: headingRef, inView: headingInView } = useInView(0.3)
  const { ref: gridRef, inView: gridInView } = useInView(0.1)
  useEffect(() => { filmsAPI.list(filter === 'All' ? undefined : filter).then(setFilms).catch(() => {}) }, [filter])

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div ref={headingRef} initial={{ opacity: 0, y: 30 }} animate={headingInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <SectionLabel text="The Artainment" />
            <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.95, margin: '0 0 48px' }}>Our Films</h1>
          </motion.div>
          <div className="films-filter" style={{ display: 'flex', gap: 10, marginBottom: 56, flexWrap: 'wrap' }}>
            {genres.map(g => (
              <button key={g} onClick={() => setFilter(g)}
                style={{ background: filter === g ? 'var(--red)' : 'transparent', border: `1px solid ${filter === g ? 'var(--red)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: filter === g ? 'var(--text)' : 'var(--text-secondary)', padding: '10px 22px', minHeight: 40, borderRadius: 6, transition: 'all 0.2s', fontWeight: 500 }}>{g}</button>
            ))}
          </div>
          <motion.div ref={gridRef} variants={stagger} initial="hidden" animate={gridInView ? 'visible' : 'hidden'}
            className="films-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {films.map((film, i) => (
              <motion.div key={film.id} variants={fadeUp}>
                <Link to={`/films/${film.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', paddingBottom: '145%', aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', marginBottom: 14, background: 'var(--bg-muted)' }}>
                    <img src={imgOr('film', film.poster_url, i)} alt={film.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    {film.tag && <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: 1.5, background: 'var(--red)', color: 'var(--text)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 700 }}>{film.tag}</span>}
                  </div>
                  <h3 style={{ fontFamily: 'Chonburi, cursive', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>{film.title}</h3>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>{film.year} · {film.genre}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--red)', marginLeft: 'auto', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={12} color="var(--red)" /> {film.rating}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
