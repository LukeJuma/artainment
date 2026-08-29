import { motion } from 'framer-motion'
import { type Talent } from '../../lib/api'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { MediaArt } from '../ui/MediaArt'
import { Link } from 'react-router-dom'

export function TalentSection({ talent }: { talent: Talent[] }) {
  const { ref, inView } = useInView()

  if (!talent.length) return null

  return (
    <Section style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel text="Our Actors" />
        <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 36px' }}>Meet the Cast</h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="talent-grid-home"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {talent.slice(0, 5).map(t => (
            <motion.div key={t.id} variants={fadeUp}>
              <Link to={`/actors/${t.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', height: 320, borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: 'var(--bg-muted)' }}>
                  <MediaArt type="actor" title={t.name} src={t.image_url} alt={t.name} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s', zIndex: 2 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff' }}>View Profile</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Chonburi', fontSize: 14, color: 'var(--text)', margin: '0 0 3px' }}>{t.name}</h3>
                <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)' }}>{t.role}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
