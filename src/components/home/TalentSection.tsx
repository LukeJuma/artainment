import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Talent } from '../../lib/api'
import { imgOr } from '../../lib/utils'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function TalentSection({ talent }: { talent: Talent[] }) {
  const { ref, inView } = useInView()
  return (
    <Section dark={false}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <SectionLabel text="The People" />
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, margin: 0 }}>Meet Our Talent</h2>
          </div>
          <Link to="/talent" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>Full Roster →</Link>
        </div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="talent-grid-home"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(talent.length, 5)}, 1fr)`, gap: 24 }}>
          {talent.map((t, i) => (
            <motion.div key={t.id} variants={fadeUp} style={{ textAlign: 'center' }}>
              <Link to={`/talent/${t.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', paddingBottom: '130%', borderRadius: 6, overflow: 'hidden', marginBottom: 16, background: '#2d2c30' }}>
                  <img src={imgOr('talent', t.image_url, i)} alt={t.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(41,40,44,0.7) 0%, transparent 50%)' }} />
                </div>
                <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{t.name}</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#F00000', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{t.role}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t.credits} credits</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
