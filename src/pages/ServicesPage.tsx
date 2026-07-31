import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { servicesAPI, type Service } from '../lib/api'
import { imgOr } from '../lib/utils'
import { useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

function ServiceRow({ service: s, index: i }: { service: Service; index: number }) {
  const { ref, inView } = useInView(0.2)
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
      className="service-row"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-muted)', overflow: 'hidden', direction: i % 2 === 1 ? 'rtl' : 'ltr' }}>
      <div style={{ overflow: 'hidden', height: 340, direction: 'ltr' }}>
        <img src={imgOr('service', s.image_url, i)} alt={s.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
      </div>
      <div style={{ direction: 'ltr', padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Domine, serif', fontSize: 52, color: 'color-mix(in srgb, var(--red) 8%, transparent)', fontWeight: 300, lineHeight: 1, marginBottom: 16 }}>{String(i + 1).padStart(2, '0')}</div>
        <h2 style={{ fontFamily: 'Chonburi, cursive', fontSize: 28, fontWeight: 600, color: 'var(--text)', margin: '0 0 16px' }}>{s.title}</h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(14px, 1.5vw, 15px)', lineHeight: 1.8, color: 'var(--text-secondary)', margin: '0 0 36px' }}>{s.description}</p>
        <Link to="/contact" style={{ background: 'var(--red)', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text)', padding: '14px 28px', minHeight: 48, display: 'inline-flex', alignItems: 'center', borderRadius: 6, textDecoration: 'none', alignSelf: 'flex-start' }}>Book This Service</Link>
      </div>
    </motion.div>
  )
}

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const { ref: headingRef, inView: headingInView } = useInView(0.3)
  useEffect(() => { servicesAPI.list().then(setServices).catch(() => {}) }, [])

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div ref={headingRef} initial={{ opacity: 0, y: 30 }} animate={headingInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <SectionLabel text="What We Offer" />
            <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.95, margin: '0 0 24px' }}>Our Services</h1>
            <p style={{ fontFamily: 'Domine, serif', fontSize: 22, color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: 560, margin: '0 0 80px', lineHeight: 1.7 }}>From a single photograph to a full feature film, we bring the same artistry and intention to every project.</p>
          </motion.div>
          <div style={{ display: 'grid', gap: 2, background: 'rgba(255,255,255,0.04)' }}>
            {services.map((s, i) => (
              <ServiceRow key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
