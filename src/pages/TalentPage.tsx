import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { talentAPI, type Talent } from '../lib/api'
import { imgOr } from '../lib/utils'
import { stagger, fadeUp, useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

export function TalentPage() {
  const [talent, setTalent] = useState<Talent[]>([])
  const { ref, inView } = useInView(0.1)
  useEffect(() => { talentAPI.list().then(setTalent).catch(() => {}) }, [])

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="The Collective" />
          <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.95, margin: '0 0 80px' }}>Our Talent</h1>
          <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 32 }}>
            {talent.map((t, i) => (
              <motion.div key={t.id} variants={fadeUp}>
                <Link to={`/talent/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', paddingBottom: '130%', borderRadius: 6, overflow: 'hidden', marginBottom: 16, background: 'var(--bg-muted)' }}>
                    <img src={imgOr('talent', t.image_url, i)} alt={t.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, color-mix(in srgb, var(--bg-muted) 85%, transparent) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                      <div style={{ fontFamily: 'Chonburi, cursive', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{t.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>{t.credits} credits</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
