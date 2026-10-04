import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { seriesAPI, type Series } from '../lib/api'
import { stagger, fadeUp, useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { IconStar } from '../components/ui/Icons'
import { MediaArt } from '../components/ui/MediaArt'

export function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const { ref: headingRef, inView: headingInView } = useInView(0.3)
  const { ref: gridRef, inView: gridInView } = useInView(0.1)

  useEffect(() => {
    seriesAPI.listPaginated(1)
      .then(r => { setSeriesList(r.data); setHasMore(r.current_page < r.last_page) })
      .catch(error => {
        console.error('Failed to load series:', error);
        setSeriesList([]);
      })
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const r = await seriesAPI.listPaginated(nextPage)
      setSeriesList(prev => [...prev, ...r.data])
      setPage(nextPage)
      setHasMore(r.current_page < r.last_page)
    } catch (error) {
      console.error('Failed to load more series:', error);
    } finally { 
      setLoadingMore(false) 
    }
  }, [page, loadingMore, hasMore])

  const genres = ['All', ...Array.from(new Set(seriesList.map(s => s.genre).filter(Boolean)))]
  const filtered = filter === 'All' ? seriesList : seriesList.filter(s => s.genre === filter)

  const heroArt = seriesList.find(s => s.backdrop_url)?.backdrop_url
    || seriesList.find(s => s.poster_url)?.poster_url
    || null

  return (
    <div style={{ paddingTop: 0 }}>
      {/* Cinematic listing band */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--ds-ink-950)' }}>
        {heroArt ? (
          <img src={heroArt} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(900px 400px at 70% 0%, rgba(225,29,72,0.18), transparent 60%), linear-gradient(160deg, #17151b 0%, #0d0d0f 60%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: 'clamp(120px, 18vh, 170px) 32px clamp(40px, 6vh, 64px)' }}>
          <div style={{ marginBottom: 18 }}>
            <Breadcrumbs tone="light" items={[{ label: 'Home', to: '/' }, { label: 'Series' }]} />
          </div>
          <motion.div ref={headingRef} initial={{ opacity: 0, y: 30 }} animate={headingInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 28, height: 2, background: 'var(--ds-gold)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                Originals
              </span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 400, color: '#fff', lineHeight: 0.95, margin: 0 }}>
              TV Series
            </h1>
          </motion.div>
        </div>
      </div>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {genres.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 56, flexWrap: 'wrap' }}>
              {genres.map(g => (
                <button key={g} onClick={() => setFilter(g)}
                  style={{ background: filter === g ? 'var(--red)' : 'transparent', border: `1px solid ${filter === g ? 'var(--red)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: filter === g ? 'var(--text)' : 'var(--text-secondary)', padding: '10px 22px', minHeight: 40, borderRadius: 'var(--ds-radius-pill)', transition: 'all 0.2s', fontWeight: 500 }}>{g}</button>
              ))}
            </div>
          )}
          <motion.div ref={gridRef} variants={stagger} initial="hidden" animate={gridInView ? 'visible' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {filtered.map(s => (
              <motion.div key={s.id} variants={fadeUp}>
                <Link to={`/series/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', paddingBottom: '145%', aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', marginBottom: 14, background: 'var(--bg-muted)' }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <MediaArt type="series" title={s.title} src={s.poster_url} alt={s.title} />
                    </div>
                    {s.tag && <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: 1.5, background: 'var(--red)', color: 'var(--text)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 700, zIndex: 2 }}>{s.tag}</span>}
                  </div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>{s.title}</h3>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>
                      {s.year} · {s.genre}
                      {s.seasons_count ? ` · ${s.seasons_count} season${s.seasons_count > 1 ? 's' : ''}` : ''}
                      {s.episodes_count ? ` · ${s.episodes_count} episodes` : ''}
                    </span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--red)', marginLeft: 'auto', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={12} color="var(--red)" /> {s.rating}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <button onClick={loadMore} disabled={loadingMore}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, letterSpacing: 1, padding: '12px 36px', borderRadius: 'var(--ds-radius-pill)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          {filtered.length === 0 && seriesList.length > 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-muted)' }}>
              No series in this genre - check back soon.
            </div>
          )}
          {seriesList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-muted)' }}>
              No series yet - check back soon.
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
