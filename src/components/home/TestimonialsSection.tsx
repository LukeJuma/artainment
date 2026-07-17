import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Testimonial } from '../../lib/api'
import { Section } from '../ui/Section'

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (testimonials.length <= 1) return
    const t = setInterval(() => setActive(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [testimonials.length])

  if (testimonials.length === 0) return null

  return (
    <Section style={{ background: '#F00000', padding: '100px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 80, color: 'rgba(255,255,255,0.15)', lineHeight: 0.8, marginBottom: 40 }}>"</div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.6, color: '#fff', fontStyle: 'italic', margin: '0 0 40px', fontWeight: 300 }}>{testimonials[active].quote}</p>
            <div>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{testimonials[active].name}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{testimonials[active].role}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 40 }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
      </div>
    </Section>
  )
}
