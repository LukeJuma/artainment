import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { Button } from '../ui/Button'
import { IconArrowRight } from '../ui/Icons'

const OFFERS = [
  { label: 'Book Photography', desc: 'Editorial, commercial & events' },
  { label: 'Book Videography', desc: 'Our flagship craft', spotlight: true },
  { label: 'Commission a Film', desc: 'Features, shorts, documentaries' },
  { label: 'Hire Our Actors', desc: 'Casting & performance' },
  { label: 'Partner With Us', desc: 'Brand stories & sponsorship' },
]

export function CTASection() {
  const { ref, inView } = useInView()
  return (
    <Section style={{ background: 'var(--ds-surface)', borderTop: '1px solid var(--ds-section-line)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 80px)', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: 'var(--ds-gold-cta)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', fontWeight: 700 }}>
                Work With Us
              </span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(44px, 6vw, 76px)', lineHeight: 0.95, color: 'var(--ds-text)', margin: '0 0 16px' }}>
              Ready to Tell<br />Your Story?
            </h2>
            <p style={{ fontFamily: "'Domine', serif", fontSize: 17, lineHeight: 1.7, color: 'var(--ds-text-2)', fontStyle: 'italic', margin: '0 0 28px', maxWidth: 440 }}>
              From concept to screen, we bring your vision to life with artistry, precision and an African heart.
            </p>
            <Button to="/contact" variant="primary">
              Start a Project <IconArrowRight size={14} />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {OFFERS.map(offer => (
              <Link
                key={offer.label}
                to="/contact"
                style={{
                  background: offer.spotlight ? 'var(--ds-brand)' : 'var(--ds-surface-2)',
                  border: offer.spotlight ? 'none' : '1px solid var(--ds-card-line)',
                  boxShadow: offer.spotlight ? 'var(--ds-shadow-glow-brand)' : 'var(--ds-card-shadow)',
                  borderRadius: 'var(--ds-radius-md)',
                  padding: '16px 20px',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'transform 0.25s var(--ds-ease-out), border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <span>
                  <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: offer.spotlight ? '#fff' : 'var(--ds-text)' }}>
                    {offer.label}
                  </span>
                  <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: offer.spotlight ? 'rgba(255,255,255,0.75)' : 'var(--ds-text-3)', marginTop: 2 }}>
                    {offer.desc}
                  </span>
                </span>
                <IconArrowRight size={16} color={offer.spotlight ? '#fff' : 'var(--ds-gold-cta)'} />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
