import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productionsAPI, type Production } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

const statusColor: Record<string, string> = { completed: '#22c55e', in_production: '#F7BB0E', upcoming: 'rgba(255,255,255,0.4)' }

export function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([])
  useEffect(() => { productionsAPI.list().then(setProductions).catch(() => {}) }, [])

  return (
    <div style={{ paddingTop: 100 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="Our Work" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: '#fff', lineHeight: 0.95, margin: '0 0 80px' }}>Productions</h1>
          <div style={{ display: 'grid', gap: 3, background: 'rgba(255,255,255,0.04)' }}>
            {productions.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="production-row"
                style={{ display: 'grid', gridTemplateColumns: '400px 1fr', background: '#1E1D21', overflow: 'hidden' }}>
                <div style={{ height: 260, overflow: 'hidden' }}>
                  <img src={imgOr('production', p.image_url, i)} alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                </div>
                <div style={{ padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: statusColor[p.status] || 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>● {p.status.replace('_', ' ')}</span>
                    {p.type && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{p.type}</span>}
                  </div>
                  <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 34, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>{p.title}</h2>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{p.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
