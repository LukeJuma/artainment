import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { Badge } from '../ui/Badge'

interface Pillar {
  num: string
  title: string
  blurb: string
  image: string
  points: string[]
  cta: string
  spotlight?: boolean
}

// The other five ecosystem units are folded into these three pillars —
/// nothing from the original eight is dropped, only redistributed.
const pillars: Pillar[] = [
  {
    num: '01',
    title: 'Photography',
    blurb: 'Editorial, commercial and event photography.',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80&auto=format&fit=crop',
    points: ['Editorial & portrait sessions', 'Commercial & brand shoots', 'Event & red-carpet coverage'],
    cta: 'Book a shoot',
  },
  {
    num: '02',
    title: 'Videography',
    blurb: 'Corporate, music video and event coverage — our flagship craft.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80&auto=format&fit=crop',
    points: [
      'Film Production — features, shorts, documentaries',
      'Corporate, music videos & live events',
      'Creative Agency — scriptwriting, directing, brand content',
      'Acting Group & Talent Development — casting, coaching, pathways',
    ],
    cta: 'Start a production',
    spotlight: true,
  },
  {
    num: '03',
    title: 'Streaming',
    blurb: 'Our digital platform for African stories.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80&auto=format&fit=crop',
    points: ['Films, series & podcasts on demand', 'Mic Mtaani TV — community voices', 'Premieres & exclusive drops'],
    cta: 'Start watching',
  },
]

export function WhoWeAre() {
  const { ref, inView } = useInView()
  return (
    <Section style={{ background: 'var(--ds-surface)', paddingTop: 'clamp(60px, 10vw, 100px)', borderTop: '1px solid var(--ds-section-line)', borderBottom: '1px solid var(--ds-section-line)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 80px)', marginBottom: 56, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: 'var(--ds-gold)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', fontWeight: 700 }}>
                Who We Are
              </span>
            </div>
            <h2 className="section-heading" style={{ color: 'var(--ds-text)', margin: 0 }}>
              A Complete Creative<br /><span style={{ color: 'var(--ds-brand-500)' }}>Ecosystem.</span>
            </h2>
          </div>
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.8, color: 'var(--ds-text-2)', margin: '0 0 16px' }}>
              The Artainment is Kenya's foremost creative media company — a studio, a streaming platform, a talent collective, and a creative agency united under one identity.
            </p>
            <p style={{ fontFamily: "'Domine', serif", fontSize: 17, lineHeight: 1.7, color: 'var(--ds-text-3)', fontStyle: 'italic', margin: 0 }}>
              "We don't just make content. We build culture."
            </p>
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20, alignItems: 'stretch', paddingTop: 18 }}
        >
          {pillars.map(p => (
            <motion.article
              key={p.num}
              variants={fadeUp}
              className={p.spotlight ? 'pillar-spotlight' : undefined}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--ds-surface-2)',
                border: p.spotlight ? '1px solid rgba(225,29,72,0.55)' : '1px solid var(--ds-card-line)',
                borderRadius: 'var(--ds-radius-lg)',
                overflow: 'hidden',
                boxShadow: p.spotlight ? 'var(--ds-shadow-glow-brand)' : 'var(--ds-card-shadow)',
              }}
            >
              {p.spotlight && (
                <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
                  <Badge variant="gold">Most Booked</Badge>
                </div>
              )}
              {/* Portrait art */}
              <div style={{ position: 'relative', height: 300, overflow: 'hidden', background: 'linear-gradient(160deg, #1c1224 0%, #0d0d10 100%)' }}>
                <ArtImage src={p.image} alt={p.title} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)', opacity: 0.9 }} />
                <span style={{
                  position: 'absolute', left: 22, bottom: 14,
                  fontFamily: "'Chonburi', cursive", fontSize: 44, lineHeight: 1,
                  color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.4)',
                }}>
                  {p.num}
                </span>
              </div>
              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 24px 26px' }}>
                <h3 style={{ fontFamily: "'Chonburi', cursive", fontWeight: 400, fontSize: 24, color: 'var(--ds-text)', margin: '0 0 8px' }}>
                  {p.title}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.65, color: 'var(--ds-text-2)', margin: '0 0 16px' }}>
                  {p.blurb}
                </p>
                <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: '16px 0 0', borderTop: '1px solid var(--ds-card-line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.points.map(pt => (
                    <li key={pt} style={{ display: 'flex', gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.55, color: 'var(--ds-text-2)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.spotlight ? 'var(--ds-brand-400)' : 'var(--ds-gold)', flexShrink: 0, marginTop: 6 }} />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto' }}>
                  <Link
                    to="/contact"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                      textDecoration: 'none',
                      color: p.spotlight ? '#fff' : 'var(--ds-gold-cta)',
                      background: p.spotlight ? 'var(--ds-brand)' : 'transparent',
                      border: p.spotlight ? 'none' : '1.5px solid var(--ds-gold-cta)',
                      boxShadow: p.spotlight ? 'var(--ds-shadow-glow-brand)' : 'none',
                      padding: '12px 26px', borderRadius: 'var(--ds-radius-pill)',
                      transition: 'all var(--ds-dur-fast) var(--ds-ease-out)',
                    }}
                  >
                    {p.cta} →
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

function ArtImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )
}
