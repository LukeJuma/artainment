import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { servicesAPI, type Service } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  useEffect(() => { servicesAPI.list().then(setServices).catch(() => {}) }, [])

  return (
    <div style={{ paddingTop: 100 }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="What We Offer" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, color: '#fff', lineHeight: 0.95, margin: '0 0 24px' }}>Our Services</h1>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', maxWidth: 560, margin: '0 0 80px', lineHeight: 1.7 }}>From a single photograph to a full feature film, we bring the same artistry and intention to every project.</p>
          <div style={{ display: 'grid', gap: 2, background: 'rgba(255,255,255,0.04)' }}>
            {services.map((s, i) => (
              <div key={s.id} className="service-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#1E1D21', overflow: 'hidden', direction: i % 2 === 1 ? 'rtl' : 'ltr' }}>
                <div style={{ overflow: 'hidden', height: 340, direction: 'ltr' }}>
                  <img src={imgOr('service', s.image_url, i)} alt={s.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                </div>
                <div style={{ direction: 'ltr', padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, color: 'rgba(247,187,14,0.12)', fontWeight: 300, lineHeight: 1, marginBottom: 16 }}>{String(i + 1).padStart(2, '0')}</div>
                  <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>{s.title}</h2>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)', margin: '0 0 36px' }}>{s.description}</p>
                  <Link to="/contact" style={{ background: '#F00000', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '14px 28px', borderRadius: 6, textDecoration: 'none', alignSelf: 'flex-start' }}>Book This Service →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
