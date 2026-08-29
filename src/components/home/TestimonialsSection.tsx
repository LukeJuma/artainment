import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { type Testimonial } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0)
  const { ref, inView } = useInView()

  useEffect(() => { setActive(0) }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length < 2) return
    const t = setInterval(() => setActive(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [testimonials.length])

  const current = testimonials[active]
  if (!current) return null

  return (
    <Section style={{ background: 'var(--bg-muted)' }}>
      <div ref={ref} style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel text="Testimonials" />
        <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p style={{ fontFamily: 'Domine, serif', fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: 1.7, color: 'var(--text)', fontStyle: 'italic', margin: '0 0 28px' }}>
            "{current.quote}"
          </p>
          <div>
            <span style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{current.name}</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>{current.role}</span>
          </div>
        </motion.div>
        {testimonials.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                width: i === active ? 24 : 8, height: 8, borderRadius: 4, border: 'none',
                background: i === active ? 'var(--red)' : 'var(--border)', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
