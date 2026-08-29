import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { talentAPI, type Talent } from '../lib/api'
import { stagger, fadeUp, useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { MediaArt } from '../components/ui/MediaArt'

export function TalentPage() {
  const [talent, setTalent] = useState<Talent[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const { ref, inView } = useInView(0.1)

  useEffect(() => {
    talentAPI.listPaginated(1)
      .then(r => { setTalent(r.data); setHasMore(r.current_page < r.last_page) })
      .catch(() => {})
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const r = await talentAPI.listPaginated(nextPage)
      setTalent(prev => [...prev, ...r.data])
      setPage(nextPage)
      setHasMore(r.current_page < r.last_page)
    } catch {} finally { setLoadingMore(false) }
  }, [page, loadingMore, hasMore])

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="The Collective" />
          <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.95, margin: '0 0 80px' }}>Our Actors</h1>
          <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 32 }}>
            {talent.map(t => (
              <motion.div key={t.id} variants={fadeUp}>
                <Link to={`/actors/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', paddingBottom: '130%', borderRadius: 6, overflow: 'hidden', marginBottom: 16, background: 'var(--bg-muted)' }}>
                    <MediaArt type="actor" title={t.name} src={t.image_url} alt={t.name} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, color-mix(in srgb, var(--bg-muted) 85%, transparent) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                      <div style={{ fontFamily: 'Chonburi, cursive', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{t.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>{t.credits} credits</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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
