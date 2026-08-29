import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Film } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { MediaArt } from '../ui/MediaArt'
import { IconChevronLeft, IconChevronRight, IconStar } from '../ui/Icons'

export function FilmsCarousel({ films }: { films: Film[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200))

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!films.length) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = vw < 768 ? 170 : 220
    scrollRef.current.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' })
  }

  const cardW = vw < 768 ? 160 : 200
  const cardH = vw < 768 ? 240 : 300

  return (
    <Section style={{ background: 'var(--bg)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <SectionLabel text="Now Streaming" />
            <h2 className="section-heading" style={{ color: 'var(--text)', margin: 0 }}>Featured Movies</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => scroll('left')} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}><IconChevronLeft size={16} /></button>
            <button onClick={() => scroll('right')} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}><IconChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="films-scroll"
        style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingLeft: 'max(16px, calc((100vw - 1200px)/2))', paddingRight: 16, paddingBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {films.map((film, i) => (
          <motion.div key={film.id} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06, duration: 0.5 }}
            style={{ flexShrink: 0, width: cardW, scrollSnapAlign: 'start' }}>
            <Link to={`/films/${film.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative', height: cardH, borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: 'var(--bg-muted)' }}>
                <MediaArt type="film" title={film.title} src={film.poster_url} alt={film.title} />
                {film.tag && <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, background: film.tag === 'Coming Soon' ? '#F59E0B' : 'var(--red)', color: '#fff', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{film.tag}</span>}
              </div>
              <h3 style={{ fontFamily: 'Chonburi', fontSize: 14, color: 'var(--text)', margin: '0 0 4px' }}>{film.title}</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)' }}>{film.year}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
                <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)' }}>{film.genre}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, color: 'var(--red)', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans' }}><IconStar size={10} color="var(--red)" /> {film.rating}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <Link to="/films" className="btn-outline">View All Movies</Link>
      </div>
    </Section>
  )
}
