import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { filmsAPI, type Film } from '../../lib/api'
import { imgOr } from '../../lib/utils'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function FilmsCarousel() {
  const [films, setFilms] = useState<Film[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()

  useEffect(() => { filmsAPI.list().then(setFilms).catch(() => {}) }, [])

  return (
    <Section>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <SectionLabel text="Now Streaming" />
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, margin: 0 }}>Featured Films</h2>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="films-scroll"
        style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingLeft: 'max(80px, calc((100vw - 1280px)/2))', paddingRight: 80, paddingBottom: 8, scrollbarWidth: 'none' }}>
        {films.map((film, i) => (
          <motion.div key={film.id} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08, duration: 0.6 }}
            style={{ flexShrink: 0, width: 220 }}>
            <Link to={`/films/${film.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative', height: 320, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                <img src={imgOr('film', film.poster_url, i)} alt={film.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                {film.tag && <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: 1.5, background: '#F00000', color: '#fff', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 700 }}>{film.tag}</span>}
              </div>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{film.title}</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{film.year}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{film.genre}</span>
                <span style={{ marginLeft: 'auto', color: '#F7BB0E', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>★ {film.rating}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 56 }}>
        <Link to="/films" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', padding: '14px 40px', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>View All Films →</Link>
      </div>
    </Section>
  )
}
