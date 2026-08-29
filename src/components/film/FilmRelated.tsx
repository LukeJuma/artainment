import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Film } from '../../lib/api'
import { FadeIn } from '../ui/FadeIn'
import { SectionLabel } from '../ui/SectionLabel'
import { IconStar } from '../ui/Icons'
import { MediaArt } from '../ui/MediaArt'

export function FilmRelated({ films }: { films: Film[] }) {
  const reduced = useReducedMotion()
  if (!films.length) return null

  return (
    <section className="section-pad" style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeIn>
          <SectionLabel text="Keep watching" />
          <h2 className="section-heading" style={{ margin: '0 0 40px' }}>More Like This</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
          {films.map(film => (
            <motion.div key={film.id} whileHover={reduced ? {} : { y: -6 }} transition={{ duration: 0.25 }}>
              <Link to={`/films/${film.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'relative', aspectRatio: '2/3', borderRadius: 10, overflow: 'hidden',
                  marginBottom: 14, background: 'var(--bg-muted)',
                }}>
                  <MediaArt type="film" title={film.title} src={film.poster_url} alt={film.title} />
                  {film.tag && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10, fontFamily: 'DM Sans', fontSize: 9,
                      fontWeight: 700, background: 'var(--red)', color: '#fff', padding: '3px 9px',
                      borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5, zIndex: 2,
                    }}>
                      {film.tag}
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: 'Chonburi, cursive', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
                  {film.title}
                </h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>{film.year} · {film.genre}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto',
                    color: 'var(--red)', fontWeight: 600, fontSize: 12, fontFamily: 'DM Sans',
                  }}>
                    <IconStar size={12} color="var(--red)" /> {film.rating}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
