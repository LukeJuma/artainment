import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { talentAPI, type Talent } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

export function TalentPage() {
  const [talent, setTalent] = useState<Talent[]>([])
  useEffect(() => { talentAPI.list().then(setTalent).catch(() => {}) }, [])

  return (
    <div style={{ paddingTop: 100 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="The Collective" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: '#fff', lineHeight: 0.95, margin: '0 0 80px' }}>Our Talent</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
            {talent.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={`/talent/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative', paddingBottom: '120%', borderRadius: 6, overflow: 'hidden', marginBottom: 16, background: '#2d2c30' }}>
                    <img src={imgOr('talent', t.image_url, i)} alt={t.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(41,40,44,0.85) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                      <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 600, color: '#fff' }}>{t.name}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#F00000', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{t.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t.credits} credits</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
