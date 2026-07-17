import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Film } from '../../lib/api'
import { imgOr } from '../../lib/utils'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function FeaturedProduction({ film }: { film: Film | null }) {
  const { ref, inView } = useInView()
  if (!film) return null

  return (
    <Section style={{ padding: 0, overflow: 'hidden' }}>
      <div ref={ref} className="featured" style={{ position: 'relative', minHeight: 600 }}>
        <img src={imgOr('film', film.backdrop_url)} alt={film.title}
          style={{ width: '100%', height: 600, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(41,40,44,0.95) 35%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, x: -50 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="featured-content"
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
          <SectionLabel text="Featured Production" />
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {film.tag && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, background: '#F00000', color: '#fff', padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 600 }}>{film.tag}</span>}
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase' }}>{film.genre}</span>
            {film.duration && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase' }}>{film.duration}</span>}
          </div>
          <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 0.95 }}>{film.title}</h2>
          {film.synopsis && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.75, color: 'rgba(255,255,255,0.7)', maxWidth: 440, margin: '0 0 36px' }}>{film.synopsis}</p>}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link to={`/films/${film.slug}`} style={{ background: '#F00000', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '14px 32px', borderRadius: 6, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>▶ Watch Now</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#F7BB0E', fontSize: 18 }}>★</span>
              <span style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, color: '#fff', fontWeight: 600 }}>{film.rating}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>/ 10</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}
