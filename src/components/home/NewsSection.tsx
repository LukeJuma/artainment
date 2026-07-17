import { motion } from 'framer-motion'
import { type NewsArticle } from '../../lib/api'
import { imgOr } from '../../lib/utils'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function NewsSection({ news }: { news: NewsArticle[] }) {
  const { ref, inView } = useInView()
  return (
    <Section dark={false}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionLabel text="Latest News" />
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, margin: '0 0 64px' }}>Stories & Updates</h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="news-grid"
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 32, alignItems: 'start' }}>
          {news.map((item, i) => (
            <motion.article key={item.id} variants={fadeUp}>
              <div style={{ overflow: 'hidden', borderRadius: 6, marginBottom: 20, background: '#2d2c30', height: i === 0 ? 300 : 200 }}>
                <img src={imgOr('news', item.image_url, i)} alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 1.5, color: '#F00000', textTransform: 'uppercase', fontWeight: 600 }}>{item.category}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}</span>
              </div>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: i === 0 ? 22 : 16, fontWeight: 600, color: '#fff', margin: '0 0 12px', lineHeight: 1.3 }}>{item.title}</h3>
              {i === 0 && item.excerpt && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{item.excerpt}</p>}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
