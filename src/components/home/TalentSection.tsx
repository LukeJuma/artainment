import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { talentAPI, type Talent } from '../../lib/api'
import { imgOr } from '../../lib/utils'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { Link } from 'react-router-dom'

export function TalentSection() {
  const [talent, setTalent] = useState<Talent[]>([])
  const { ref, inView } = useInView()
  useEffect(() => { talentAPI.list().then(setTalent).catch(() => {}) }, [])

  return (
    <Section style={{ background: 'var(--bg)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel text="Our Talent" />
        <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 36px' }}>Meet the Collective</h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="talent-grid-home"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {talent.slice(0, 5).map(t => (
            <motion.div key={t.id} variants={fadeUp}>
              <Link to={`/talent/${t.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', height: 320, borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: 'var(--bg-muted)' }}>
                  <img src={imgOr('talent', t.image_url)} alt={t.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} loading="lazy" />
                </div>
                <h3 style={{ fontFamily: 'Chonburi', fontSize: 14, color: 'var(--text)', margin: '0 0 3px' }}>{t.name}</h3>
                <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)' }}>{t.role}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
