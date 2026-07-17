import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function CTASection() {
  const { ref, inView } = useInView()
  return (
    <Section style={{ padding: '140px 80px', position: 'relative', overflow: 'hidden' }}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <SectionLabel text="Work With Us" />
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 5vw, 72px)', fontWeight: 700, color: '#fff', lineHeight: 1, margin: '0 0 24px' }}>Ready to Tell<br />Your Story?</h2>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', margin: 0 }}>From concept to screen, we bring your vision to life with artistry, precision and an African heart.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Book Photography', 'Book Videography', 'Commission a Film', 'Hire Our Talent', 'Partner With Us'].map((label) => (
              <Link key={label} to="/contact"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', padding: '18px 28px', borderRadius: 6, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {label} <span style={{ color: '#F00000' }}>→</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
