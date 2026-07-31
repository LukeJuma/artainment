import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productionsAPI, type Production } from '../lib/api'
import { imgOr } from '../lib/utils'
import { useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

const statusColor: Record<string, string> = { completed: '#22c55e', in_production: 'var(--red)', upcoming: 'var(--text-muted)' }

export function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([])
  const { ref: headingRef, inView: headingInView } = useInView(0.3)
  useEffect(() => { productionsAPI.list().then(setProductions).catch(() => {}) }, [])

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div ref={headingRef} initial={{ opacity: 0, y: 30 }} animate={headingInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <SectionLabel text="Our Work" />
            <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.95, margin: '0 0 80px' }}>Productions</h1>
          </motion.div>
          <div style={{ display: 'grid', gap: 3, background: 'var(--border)' }}>
            {productions.map((p, i) => (
              <ProductionRow key={p.id} production={p} index={i} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}

function ProductionRow({ production: p, index: i }: { production: Production; index: number }) {
  const { ref, inView } = useInView(0.2)
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.08 }}
      className="production-row"
      style={{ display: 'grid', gridTemplateColumns: '400px 1fr', background: 'var(--bg-muted)', overflow: 'hidden' }}>
      <div style={{ height: 260, overflow: 'hidden' }}>
        <img src={imgOr('production', p.image_url, i)} alt={p.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
      </div>
      <div style={{ padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: statusColor[p.status] || 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[p.status] || 'var(--text-muted)', flexShrink: 0 }} />{p.status.replace('_', ' ')}</span>
          {p.type && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>{p.type}</span>}
        </div>
        <h2 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>{p.title}</h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{p.year}</p>
      </div>
    </motion.div>
  )
}
