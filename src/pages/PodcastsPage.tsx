import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { podcastAPI, type Podcast } from '../lib/api'
import { stagger, fadeUp, useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { MediaArt } from '../components/ui/MediaArt'
import { IconPlay } from '../components/ui/Icons'

export function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const { ref, inView } = useInView(0.1)

  useEffect(() => {
    podcastAPI.listPaginated(1)
      .then(r => { setPodcasts(r.data); setHasMore(r.current_page < r.last_page) })
      .catch(() => {})
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const r = await podcastAPI.listPaginated(nextPage)
      setPodcasts(prev => [...prev, ...r.data])
      setPage(nextPage)
      setHasMore(r.current_page < r.last_page)
    } catch {} finally { setLoadingMore(false) }
  }, [page, loadingMore, hasMore])

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionLabel text="Listen" />
            <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.95, margin: '0 0 48px' }}>Our Podcasts</h1>
          </motion.div>
          <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {podcasts.map(p => (
              <motion.div key={p.id} variants={fadeUp}>
                <Link to={`/podcasts/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', marginBottom: 14, background: 'var(--bg-muted)' }}>
                    <MediaArt type="podcast" title={p.title} src={p.cover_url} alt={p.title} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.3s', zIndex: 2 }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconPlay size={20} color="#fff" /></span>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: 'Chonburi, cursive', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>{p.title}</h3>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.host && <span>{p.host} · </span>}
                    {p.category && <span>{p.category} · </span>}
                    <span>{p.episodes_count ?? 0} episodes</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          {podcasts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-muted)' }}>
              No podcasts yet — check back soon.
            </div>
          )}
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <button onClick={loadMore} disabled={loadingMore}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, letterSpacing: 1, padding: '12px 36px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
