import { motion } from 'framer-motion'
import { useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PLACEHOLDER } from '../lib/constants'

const timeline = [
  { year: '2018', title: 'Founded', desc: 'The Artainment begins as a photography and videography studio in Nairobi.' },
  { year: '2020', title: 'Film Production Begins', desc: 'We produce our first short film, launching our narrative film division.' },
  { year: '2021', title: 'Acting Group Launch', desc: 'Mic Mtaani TV and our acting development programme open their doors.' },
  { year: '2023', title: 'Streaming Platform', desc: 'Our digital streaming platform launches, bringing African stories to screens everywhere.' },
  { year: '2024', title: 'Continental Recognition', desc: '"The Red Soil" wins Best African Film at the Zanzibar International Film Festival.' },
]

const pillars = [
  { title: 'Photography', desc: 'Editorial, commercial and event photography.', to: '/contact' },
  { title: 'Videography', desc: 'Corporate, music video and event coverage.', to: '/contact' },
  { title: 'Streaming', desc: 'Our digital platform for African stories.', to: '/movies' },
]

export function AboutPage() {
  const { ref: missionRef, inView: missionInView } = useInView(0.2)
  const { ref: visionRef, inView: visionInView } = useInView(0.2)
  const { ref: pillarRef, inView: pillarInView } = useInView(0.1)

  return (
    <div style={{ paddingTop: 0 }}>
      {/* Cinematic hero */}
      <div className="about-hero" style={{ position: 'relative', height: 'clamp(380px, 60vh, 560px)' }}>
        <img
          src={PLACEHOLDER.hero}
          alt="About The Artainment"
          fetchPriority="high"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-left)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)', opacity: 0.6 }} />
        <div className="about-hero-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(20px, 6vw, 80px) clamp(40px, 7vh, 72px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ width: 28, height: 2, background: 'var(--ds-gold)' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              Our Story
            </span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(56px, 10vw, 120px)', fontWeight: 400, color: '#fff', lineHeight: 0.9, margin: 0 }}>
            The Artainment<br />Studios
          </h1>
        </div>
      </div>

      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
          </div>
          {/* Mission / Vision cards */}
          <div className="about-mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 'clamp(60px, 8vw, 100px)' }}>
            <motion.div
              ref={missionRef}
              initial={{ opacity: 0, x: -30 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-card-shadow)', padding: 'clamp(28px, 4vw, 44px)' }}
            >
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', marginBottom: 14 }}>
                Our Mission
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.8, color: 'var(--ds-text)', margin: 0 }}>
                To create, nurture, produce, and showcase African stories and artists - giving Kenya's creative voice a world-class platform that celebrates our culture while reaching audiences globally.
              </p>
            </motion.div>
            <motion.div
              ref={visionRef}
              initial={{ opacity: 0, x: 30 }}
              animate={visionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              style={{ background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-card-shadow)', padding: 'clamp(28px, 4vw, 44px)' }}
            >
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', marginBottom: 14 }}>
                Our Vision
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.8, color: 'var(--ds-text)', margin: 0 }}>
                East Africa's leading creative media ecosystem - a home for storytellers, a destination for audiences, and a launchpad for the artists defining the continent's cultural future.
              </p>
            </motion.div>
          </div>

          {/* Pillars */}
          <motion.div
            ref={pillarRef}
            initial={{ opacity: 0, y: 24 }}
            animate={pillarInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 'clamp(60px, 8vw, 100px)' }}
          >
            {pillars.map((p, i) => (
              <a
                key={p.title}
                href={p.to}
                style={{
                  background: i === 1 ? 'var(--ds-brand)' : 'var(--ds-surface-2)',
                  border: i === 1 ? 'none' : '1px solid var(--ds-card-line)',
                  boxShadow: i === 1 ? 'var(--ds-shadow-glow-brand)' : 'var(--ds-card-shadow)',
                  borderRadius: 'var(--ds-radius-md)',
                  padding: 24,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'transform 0.25s var(--ds-ease-out)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 2, color: i === 1 ? 'rgba(255,255,255,0.7)' : 'var(--ds-gold-cta)', marginBottom: 8 }}>
                  0{i + 1}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: i === 1 ? '#fff' : 'var(--ds-text)', marginBottom: 6 }}>
                  {p.title}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6, color: i === 1 ? 'rgba(255,255,255,0.8)' : 'var(--ds-text-2)' }}>
                  {p.desc}
                </div>
              </a>
            ))}
          </motion.div>

          {/* Timeline */}
          <div style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: 'var(--ds-gold-cta)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', fontWeight: 700 }}>
                The Journey
              </span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--ds-text)', margin: '0 0 36px', lineHeight: 1 }}>
              Milestones
            </h2>
            <div className="timeline" style={{ borderLeft: '2px solid var(--ds-gold-cta)', paddingLeft: 'clamp(24px, 4vw, 48px)' }}>
              {timeline.map((item, i) => (
                <TimelineItem key={item.year} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{
            background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)',
            borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-card-shadow)',
            padding: 'clamp(32px, 5vw, 56px)', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--ds-text)', lineHeight: 1 }}>
                Have a story to tell?
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--ds-text-2)', margin: '8px 0 0' }}>
                Photography, videography, streaming - let's build it together.
              </p>
            </div>
            <Button to="/contact" variant="primary" size="lg">Work With Us</Button>
          </div>
        </div>
      </Section>
    </div>
  )
}

function TimelineItem({ item, index }: { item: typeof timeline[number]; index: number }) {
  const { ref, inView } = useInView(0.3)
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ position: 'relative', marginBottom: 'clamp(28px, 4vw, 40px)' }}>
      <div style={{ position: 'absolute', left: 'clamp(-33px, -4vw, -57px)', top: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--ds-brand)', border: '3px solid var(--ds-surface)', boxShadow: '0 0 0 1px var(--ds-gold-cta)' }} />
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: 'var(--ds-gold-cta)', marginBottom: 6 }}>{item.year}</div>
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(22px, 3vw, 30px)', color: 'var(--ds-text)', margin: '0 0 8px' }}>{item.title}</h3>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--ds-text-2)', margin: 0, lineHeight: 1.7, maxWidth: 640 }}>{item.desc}</p>
    </motion.div>
  )
}
