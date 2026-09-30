import { useState, useEffect, useRef, useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Film, type Series } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { Badge } from '../ui/Badge'
import { MediaArt } from '../ui/MediaArt'
import { IconChevronLeft, IconChevronRight, IconStar } from '../ui/Icons'

type TrendTab = 'popular' | 'premieres' | 'recent';

const TABS: { id: TrendTab; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'premieres', label: 'Premieres' },
  { id: 'recent', label: 'Recently Added' },
];

export function FilmsCarousel({ films, series = [] }: { films: Film[]; series?: Series[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200))
  const [tab, setTab] = useState<TrendTab>('popular')
  const [genre, setGenre] = useState('All')

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const f of [...films, ...series]) if (f.genre) set.add(f.genre)
    return ['All', ...Array.from(set).sort()]
  }, [films, series])

  type PoolItem = (Film | Series) & { _kind: 'film' | 'series' };

  const pool = useMemo<PoolItem[]>(() => {
    const all: PoolItem[] = [
      ...films.map(f => ({ ...f, _kind: 'film' as const })),
      ...series.map(s => ({ ...s, _kind: 'series' as const })),
    ]
    const byGenre = genre === 'All' ? all : all.filter(f => f.genre === genre)
    if (tab === 'popular') return [...byGenre].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (tab === 'premieres') {
      return [...byGenre].sort((a, b) => String(b.year || '').localeCompare(String(a.year || '')))
    }
    return byGenre // API already returns recently-added order
  }, [films, series, tab, genre])

  if (!films.length && !series.length) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = vw < 768 ? 170 : 220
    scrollRef.current.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' })
  }

  const cardW = vw < 768 ? 160 : 200
  const cardH = vw < 768 ? 240 : 300

  const meta = (year?: string | null, genreName?: string | null, rating?: number | null) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {year && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>{year}</span>}
      {year && genreName && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />}
      {genreName && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>{genreName}</span>}
      {typeof rating === 'number' && (
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ds-gold)', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
          <IconStar size={10} color="var(--ds-gold)" filled /> {rating.toFixed(1)}
        </span>
      )}
    </div>
  )

  const pill = (active: boolean): CSSProperties => ({
    padding: '7px 18px',
    borderRadius: 'var(--ds-radius-pill)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    background: active ? 'var(--ds-brand)' : 'rgba(255,255,255,0.07)',
    color: active ? '#fff' : 'var(--ds-fog-300)',
    boxShadow: active ? 'var(--ds-shadow-glow-brand)' : 'none',
    transition: 'all var(--ds-dur-fast) var(--ds-ease-out)',
    whiteSpace: 'nowrap',
  })

  return (
    <Section style={{ background: 'var(--bg)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 28, height: 2, background: 'var(--ds-brand)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                Trends Now
              </span>
            </div>
            <h2 className="section-heading" style={{ color: 'var(--text)', margin: 0 }}>Trending Now</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', gap: 18, marginRight: 12 }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                    color: tab === t.id ? 'var(--ds-brand-400)' : 'var(--text-muted)',
                    borderBottom: tab === t.id ? '2px solid var(--ds-brand)' : '2px solid transparent',
                    paddingBottom: 4, transition: 'color var(--ds-dur-fast)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => scroll('left')} aria-label="Scroll left" style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}><IconChevronLeft size={16} /></button>
            <button onClick={() => scroll('right')} aria-label="Scroll right" style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}><IconChevronRight size={16} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 24, paddingBottom: 4 }}>
          {genres.map(g => (
            <button key={g} onClick={() => setGenre(g)} style={pill(genre === g)}>{g}</button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} className="films-scroll"
        style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingLeft: 'max(16px, calc((100vw - 1200px)/2))', paddingRight: 16, paddingBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {pool.map((item, i) => {
          const isSeries = item._kind === 'series'
          const link = `/${isSeries ? 'series' : 'films'}/${item.slug}`
          return (
            <motion.div key={`${isSeries ? 's' : 'f'}-${item.id}`} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: Math.min(i * 0.06, 0.6), duration: 0.5 }}
              style={{ flexShrink: 0, width: cardW, scrollSnapAlign: 'start' }}>
              <Link to={link} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', height: cardH, borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: 'var(--bg-muted)' }}>
                  <MediaArt type={isSeries ? 'series' : 'film'} title={item.title} src={item.poster_url} alt={item.title} />
                  {isSeries ? (
                    <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}><Badge variant="brand">Series</Badge></span>
                  ) : (item.tag ? (
                    <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}><Badge variant={item.tag === 'Coming Soon' ? 'upcoming' : 'brand'}>{item.tag}</Badge></span>
                  ) : null)}
                </div>
                <h3 style={{ fontFamily: 'Chonburi', fontSize: 14, color: 'var(--text)', margin: '0 0 4px' }}>{item.title}</h3>
                {meta(item.year, item.genre, item.rating)}
              </Link>
            </motion.div>
          )
        })}
        {!pool.length && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-muted)', padding: '24px 0' }}>
            Nothing in this genre yet.
          </p>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <Link to="/films" className="btn-outline">View All Movies</Link>
      </div>
    </Section>
  )
}
