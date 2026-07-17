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
    <Section dark={false}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px', marginBottom: 80, alignItems: 'start' }}>
          <div>
            <SectionLabel text="Who We Are" />
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, margin: 0 }}>
              A Complete<br />Creative<br /><em style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#F7BB0E', fontWeight: 300 }}>Ecosystem.</em>
            </h2>
          </div>
          <div style={{ paddingTop: 20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px' }}>The Artainment is Kenya's foremost creative media company — a studio, a streaming platform, a talent collective, and a creative agency united under one identity.</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', margin: 0 }}>"We don't just make content. We build culture."</p>
          </div>
        </div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="units-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)' }}>
          {units.map(u => (
            <motion.div key={u.num} variants={fadeUp}
              style={{ background: '#1E1D21', padding: '40px 32px', transition: 'background 0.3s', borderTop: '2px solid transparent' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: 'rgba(247,187,14,0.2)', fontWeight: 300, marginBottom: 16, lineHeight: 1 }}>{u.num}</div>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 10px' }}>{u.title}</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{u.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
