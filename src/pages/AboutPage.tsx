import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { PLACEHOLDER } from '../lib/constants'

const timeline = [
  { year: '2018', title: 'Founded', desc: 'The Artainment begins as a photography and videography studio in Nairobi.' },
  { year: '2020', title: 'Film Production Begins', desc: 'We produce our first short film, launching our narrative film division.' },
  { year: '2021', title: 'Acting Group Launch', desc: 'Mic Mtaani TV and our acting development programme open their doors.' },
  { year: '2023', title: 'Streaming Platform', desc: 'Our digital streaming platform launches, bringing African stories to screens everywhere.' },
  { year: '2024', title: 'Continental Recognition', desc: '"The Red Soil" wins Best African Film at the Zanzibar International Film Festival.' },
]

export function AboutPage() {
  return (
    <div style={{ paddingTop: 100 }}>
      <div className="about-hero" style={{ position: 'relative', height: 500 }}>
        <img src={PLACEHOLDER.hero} alt="About The Artainment"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(41,40,44,0.7)' }} />
        <div className="about-hero-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 80px 60px' }}>
          <SectionLabel text="Our Story" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(48px, 7vw, 90px)', fontWeight: 700, color: '#fff', lineHeight: 0.9, margin: 0 }}>The Artainment<br />Studios</h1>
        </div>
      </div>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="about-mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, marginBottom: 100 }}>
            <div>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 42, fontWeight: 600, color: '#fff', margin: '0 0 24px' }}>Our Mission</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', margin: 0 }}>The Artainment exists to create, nurture, produce, and showcase African stories and talent. We believe that Kenya's creative voice deserves a world-class platform — one that celebrates our culture while reaching audiences globally.</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 42, fontWeight: 600, color: '#fff', margin: '0 0 24px' }}>Our Vision</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', margin: 0 }}>To become East Africa's leading creative media ecosystem — a home for storytellers, a destination for audiences, and a launchpad for talent that will define the continent's cultural future.</p>
            </div>
          </div>
          <div className="timeline" style={{ borderLeft: '2px solid rgba(240,0,0,0.3)', paddingLeft: 48 }}>
            {timeline.map(item => (
              <div key={item.year} style={{ position: 'relative', marginBottom: 48 }}>
                <div style={{ position: 'absolute', left: -56, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#F00000', border: '3px solid #29282C' }} />
                <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 14, color: '#F7BB0E', letterSpacing: 2, marginBottom: 8 }}>{item.year}</div>
                <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
