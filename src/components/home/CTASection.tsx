import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { IconArrowRight } from '../ui/Icons'

export function CTASection() {
  const { ref, inView } = useInView()
  return (
    <Section style={{ background: 'var(--bg)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 80px)', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
            <SectionLabel text="Work With Us" />
            <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 16px' }}>Ready to Tell Your Story?</h2>
            <p style={{ fontFamily: 'Domine, serif', fontSize: 17, lineHeight: 1.7, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>From concept to screen, we bring your vision to life with artistry, precision and an African heart.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Book Photography', 'Book Videography', 'Commission a Film', 'Hire Our Talent', 'Partner With Us'].map((label) => (
              <Link key={label} to="/contact"
                style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: 'var(--text)', padding: '14px 20px', borderRadius: 6, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', minHeight: 48 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
              >
                {label} <IconArrowRight size={16} color="var(--red)" />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
