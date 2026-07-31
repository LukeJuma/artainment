import { motion } from 'framer-motion'
import { useInView } from '../lib/animations'
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
  const { ref: missionRef, inView: missionInView } = useInView(0.2)
  const { ref: visionRef, inView: visionInView } = useInView(0.2)

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="about-hero" style={{ position: 'relative', height: 400 }}>
        <img src={PLACEHOLDER.hero} alt="About The Artainment"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(41,40,44,0.7)' }} />
        <div className="about-hero-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 80px 60px' }}>
          <SectionLabel text="Our Story" />
          <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(36px, 7vw, 90px)', fontWeight: 700, color: 'var(--text)', lineHeight: 0.9, margin: 0 }}>The Artainment<br />Studios</h1>
        </div>
      </div>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="about-mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 100px)', marginBottom: 'clamp(60px, 8vw, 100px)' }}>
            <motion.div ref={missionRef} initial={{ opacity: 0, x: -30 }} animate={missionInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
              <h2 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 600, color: 'var(--text)', margin: '0 0 24px' }}>Our Mission</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(15px, 1.5vw, 16px)', lineHeight: 1.85, color: 'var(--text-secondary)', margin: 0 }}>The Artainment exists to create, nurture, produce, and showcase African stories and talent. We believe that Kenya's creative voice deserves a world-class platform — one that celebrates our culture while reaching audiences globally.</p>
            </motion.div>
            <motion.div ref={visionRef} initial={{ opacity: 0, x: 30 }} animate={visionInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
              <h2 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 600, color: 'var(--text)', margin: '0 0 24px' }}>Our Vision</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(15px, 1.5vw, 16px)', lineHeight: 1.85, color: 'var(--text-secondary)', margin: 0 }}>To become East Africa's leading creative media ecosystem — a home for storytellers, a destination for audiences, and a launchpad for talent that will define the continent's cultural future.</p>
            </motion.div>
          </div>
          <div className="timeline" style={{ borderLeft: '2px solid var(--border)', paddingLeft: 'clamp(24px, 4vw, 48px)' }}>
            {timeline.map((item, i) => (
              <TimelineItem key={item.year} item={item} index={i} />
            ))}
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
      style={{ position: 'relative', marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <div style={{ position: 'absolute', left: 'clamp(-36px, -3.5vw, -56px)', top: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--red)', border: '3px solid var(--bg)' }} />
      <div style={{ fontFamily: 'Chonburi, cursive', fontSize: 14, color: 'var(--red)', letterSpacing: 2, marginBottom: 8 }}>{item.year}</div>
      <h3 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 600, color: 'var(--text)', margin: '0 0 10px' }}>{item.title}</h3>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(14px, 1.5vw, 15px)', color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
    </motion.div>
  )
}
