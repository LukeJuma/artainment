import { useState, useEffect, useRef, useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Film, type Series } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { responsive, imgFallback, imgTransformOk } from '../../lib/images'
import { Section } from '../ui/Section'
import { Badge } from '../ui/Badge'
import { MediaArt } from '../ui/MediaArt'
import { IconChevronLeft, IconChevronRight, IconStar, IconPlay } from '../ui/Icons'

type TrendTab = 'popular' | 'premieres' | 'recent';

const TABS: { id: TrendTab; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'premieres', label: 'Premieres' },
  { id: 'recent', label: 'Recently Added' },
];

type PoolItem = (Film | Series) & { _kind: 'film' | 'series' };

function HoverCard({ item, rect, onEnter, onLeave }: {
  item: PoolItem
  rect: DOMRect
  onEnter: () => void
  onLeave: () => void
}) {
  const isSeries = item._kind === 'series'
  const art = item.backdrop_url || item.poster_url
  const width = 340
  const height = 400
  const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 12), window.innerWidth - width - 12)
  // Prefer opening downward; flip upward when near the viewport bottom
  const top = rect.bottom + height + 16 < window.innerHeight
    ? rect.top - 12
    : Math.max(12, rect.bottom - height + 12)

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: 'fixed', left, top, width, zIndex: 300,
        background: '#101014', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 30px 90px rgba(0,0,0,0.7)',
        animation: 'ds-fade-up 0.25s var(--ds-ease-out)',
      }}
    >
      <div style={{ position: 'relative', height: 170, background: 'linear-gradient(160deg, #1c1224, #0d0d10)' }}>
        {art && <img {...responsive(art)} alt="" loading="lazy" decoding="async" onLoad={imgTransformOk} onError={e => imgFallback(e, art)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,14,0.9), transparent 55%)' }} />
        {typeof item.rating === 'number' && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            padding: '5px 10px', borderRadius: 6,
          }}>
            <IconStar size={13} color="var(--ds-gold)" filled /> {item.rating.toFixed(1)}
          </span>
        )}
        <span style={{
          position: 'absolute', left: 14, bottom: 10,
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.85)',
        }}>
          {isSeries ? 'Series' : 'Movie'}
          {item.year ? ` · ${item.year}` : ''}
          {item.genre ? ` · ${item.genre}` : ''}
        </span>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#fff', lineHeight: 1, marginBottom: 8 }}>
          {item.title}
        </div>
        {item.synopsis && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', margin: '0 0 16px', overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 }}>
            {item.synopsis.length > 130 ? item.synopsis.slice(0, 130) + '…' : item.synopsis}
          </p>
        )}
        <Link
          to={`/${isSeries ? 'series' : 'movies'}/${item.slug}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#fff', color: '#101014',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
            padding: '12px', borderRadius: 8, textDecoration: 'none',
          }}
        >
          <IconPlay size={14} color="#101014" /> Watch Now
        </Link>
      </div>
    </div>
  )
}

export function FilmsCarousel({ films, series = [] }: { films: Film[]; series?: Series[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200))
  const [tab, setTab] = useState<TrendTab>('popular')
  const [genre, setGenre] = useState('All')
  const [hovered, setHovered] = useState<{ item: PoolItem; rect: DOMRect } | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [canHover] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches)

  const showHover = (item: PoolItem, el: HTMLElement) => {
    if (!canHover) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHovered({ item, rect: el.getBoundingClientRect() })
  }

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setHovered(null), 180)
  }

  // A fixed popover detaches from its card on scroll - dismiss it instead
  useEffect(() => {
    const hide = () => setHovered(null)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [])

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
    background: active ? 'var(--ds-brand)' : 'var(--ds-pill-idle-bg)',
    color: active ? '#fff' : 'var(--ds-pill-idle-fg)',
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
          <div className="films-arrows" style={{ display: 'flex', gap: 8 }}>
            <div className="films-tabs" style={{ display: 'flex', gap: 18, marginRight: 12 }}>
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
            <button onClick={() => scroll('left')} aria-label="Scroll left" className="films-scroll-arrow" style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}><IconChevronLeft size={16} /></button>
            <button onClick={() => scroll('right')} aria-label="Scroll right" className="films-scroll-arrow" style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}><IconChevronRight size={16} /></button>
          </div>
        </div>
        <div className="films-genres" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 24, paddingBottom: 4 }}>
          {genres.map(g => (
            <button key={g} onClick={() => setGenre(g)} style={pill(genre === g)}>{g}</button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} className="films-scroll"
        style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingLeft: 'max(16px, calc((100vw - 1200px)/2))', paddingRight: 16, paddingBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {pool.map((item, i) => {
          const isSeries = item._kind === 'series'
          const link = `/${isSeries ? 'series' : 'movies'}/${item.slug}`
          return (
            <motion.div key={`${isSeries ? 's' : 'f'}-${item.id}`} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} whileHover={{ y: -6 }} transition={{ delay: Math.min(i * 0.06, 0.6), duration: 0.5 }}
              onMouseEnter={e => showHover(item, e.currentTarget)}
              onMouseLeave={scheduleHide}
              style={{ flexShrink: 0, width: cardW, scrollSnapAlign: 'start' }}>
              <Link to={link} style={{ textDecoration: 'none' }}>
                <div className="zoom-hover" style={{ position: 'relative', height: cardH, borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: 'var(--bg-muted)' }}>
                  <MediaArt type={isSeries ? 'series' : 'film'} title={item.title} src={item.poster_url} alt={item.title} />
                  {typeof item.rating === 'number' && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8, zIndex: 2,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                      color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                      padding: '4px 9px', borderRadius: 6,
                    }}>
                      <IconStar size={12} color="var(--ds-gold)" filled /> {item.rating.toFixed(1)}
                    </span>
                  )}
                  {isSeries ? (
                    <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}><Badge variant="brand">Series</Badge></span>
                  ) : (item.tag ? (
                    <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}><Badge variant={item.tag === 'Coming Soon' ? 'upcoming' : 'brand'}>{item.tag}</Badge></span>
                  ) : null)}
                </div>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: 'var(--text)', margin: '0 0 4px' }}>{item.title}</h3>
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
      {/* Hover expansion: rich preview pinned near the hovered card */}
      {hovered && (
        <HoverCard
          item={hovered.item}
          rect={hovered.rect}
          onEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current) }}
          onLeave={scheduleHide}
        />
      )}
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <Link to="/movies" className="btn-outline">View All Movies</Link>
      </div>
    </Section>
  )
}
