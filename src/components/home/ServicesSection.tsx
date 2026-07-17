import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Service } from '../../lib/api'
import { imgOr } from '../../lib/utils'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function ServicesSection({ services }: { services: Service[] }) {
  const { ref, inView } = useInView()
  return (
    <Section dark={false}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <SectionLabel text="What We Do" />
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, margin: 0 }}>Our Services</h2>
          </div>
          <Link to="/services" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>All Services →</Link>
        </div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="services-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(255,255,255,0.04)' }}>
          {services.map((s, i) => (
            <motion.div key={s.id} variants={fadeUp} style={{ background: '#1E1D21', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 200, overflow: 'hidden' }}>
                <img src={imgOr('service', s.image_url, i)} alt={s.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
              </div>
              <div style={{ padding: '28px 28px 32px' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'rgba(247,187,14,0.15)', marginBottom: 8, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>{s.title}</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px' }}>{s.description}</p>
                <Link to="/contact" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 2, color: '#F00000', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none' }}>Book This →</Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
