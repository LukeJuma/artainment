import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Podcast } from '../../lib/api'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { MediaArt } from '../ui/MediaArt'
import { IconPlay, IconArrowRight } from '../ui/Icons'

export function PodcastSection({ podcasts }: { podcasts: Podcast[] }) {
  const { ref, inView } = useInView()

  if (!podcasts.length) return null

  return (
    <Section style={{ background: 'var(--bg-muted)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <SectionLabel text="Listen" />
            <h2 className="section-heading" style={{ color: 'var(--text)', margin: 0 }}>Podcasts</h2>
          </div>
          <Link to="/podcasts" className="btn-outline" style={{ padding: '10px 22px', minHeight: 40, fontSize: 12 }}>
            All Podcasts <IconArrowRight size={14} />
          </Link>
        </div>

        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {podcasts.map(p => (
            <motion.div key={p.id} variants={fadeUp}>
              <Link to={`/podcasts/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', paddingBottom: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 12, background: 'var(--bg)' }}>
                  <MediaArt type="podcast" title={p.title} src={p.cover_url} alt={p.title} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.3s', zIndex: 2 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <IconPlay size={20} color="#fff" />
                    </span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "'Chonburi', cursive", fontSize: 15, color: 'var(--text)', margin: '0 0 3px' }}>{p.title}</h3>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>
                  {p.host ? `${p.host} · ` : ''}{p.episodes_count ?? 0} episodes
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
