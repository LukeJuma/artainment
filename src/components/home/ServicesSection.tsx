import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { servicesAPI, type Service } from '../../lib/api'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const { ref, inView } = useInView()
  useEffect(() => { servicesAPI.list().then(setServices).catch(() => {}) }, [])

  return (
    <Section style={{ background: 'var(--bg-muted)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel text="What We Do" />
        <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 36px' }}>Our Services</h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {services.map(s => (
            <motion.div key={s.id} variants={fadeUp}
              style={{ background: 'var(--bg)', padding: 'clamp(20px, 3vw, 36px)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>{s.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
