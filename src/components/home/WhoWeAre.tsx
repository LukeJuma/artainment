import { motion } from 'framer-motion'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

const units = [
  { title: 'Film Production', desc: 'Feature films, shorts, documentaries.', num: '01' },
  { title: 'Photography', desc: 'Editorial, commercial and event photography.', num: '02' },
  { title: 'Videography', desc: 'Corporate, music video and event coverage.', num: '03' },
  { title: 'Streaming', desc: 'Our digital platform for African stories.', num: '04' },
  { title: 'Acting Group', desc: 'Training and developing performance talent.', num: '05' },
  { title: 'Mic Mtaani TV', desc: 'Community voices through storytelling.', num: '06' },
  { title: 'Creative Agency', desc: 'Scriptwriting, directing, brand content.', num: '07' },
  { title: 'Talent Development', desc: 'Casting, coaching and industry pathways.', num: '08' },
]

export function WhoWeAre() {
  const { ref, inView } = useInView()
  return (
    <Section style={{ background: 'var(--bg)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 80px)', marginBottom: 48, alignItems: 'start' }}>
          <div>
            <SectionLabel text="Who We Are" />
            <h2 className="section-heading" style={{ color: 'var(--text)', margin: 0 }}>
              A Complete Creative<br /><span style={{ color: 'var(--red)' }}>Ecosystem.</span>
            </h2>
          </div>
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              The Artainment is Kenya's foremost creative media company — a studio, a streaming platform, a talent collective, and a creative agency united under one identity.
            </p>
            <p style={{ fontFamily: 'Domine, serif', fontSize: 17, lineHeight: 1.7, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
              "We don't just make content. We build culture."
            </p>
          </div>
        </div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="units-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)' }}>
          {units.map(u => (
            <motion.div key={u.num} variants={fadeUp}
              style={{ background: 'var(--bg)', padding: 'clamp(20px, 3vw, 36px)', transition: 'all 0.3s' }}>
              <div style={{ fontFamily: 'Domine, serif', fontSize: 24, color: 'var(--border)', fontWeight: 700, marginBottom: 10 }}>{u.num}</div>
              <h3 style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{u.title}</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>{u.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
