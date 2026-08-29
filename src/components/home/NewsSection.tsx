import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { type NewsArticle } from '../../lib/api'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { IconClock } from '../ui/Icons'

export function NewsSection({ news }: { news: NewsArticle[] }) {
  const { ref, inView } = useInView()

  if (!news.length) return null

  return (
    <Section style={{ background: 'var(--bg)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel text="Latest News" />
        <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 36px' }}>Studio Updates</h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="news-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {news.map(n => (
            <motion.div key={n.id} variants={fadeUp} style={{
              background: 'var(--bg-muted)', borderRadius: 8, overflow: 'hidden',
              border: '1px solid var(--border)', transition: 'box-shadow 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <Link to={`/news/${n.slug}`} style={{ textDecoration: 'none' }}>
                {n.image_url && <img src={n.image_url} alt="" loading="lazy" style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
                <div style={{ padding: 16 }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--red)' }}>{n.category}</span>
                  <h3 style={{ fontFamily: 'Chonburi', fontSize: 15, color: 'var(--text)', margin: '6px 0', lineHeight: 1.3 }}>{n.title}</h3>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{n.excerpt}</p>
                  {n.published_at && (
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconClock size={12} color="var(--text-muted)" />
                      {new Date(n.published_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
