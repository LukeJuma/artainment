import { motion } from 'framer-motion'
import { type GalleryImage } from '../../lib/api'
import { PLACEHOLDER } from '../../lib/constants'
import { useInView, fadeUp, stagger } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const { ref, inView } = useInView()
  const srcs = images.length > 0 ? images.map(i => i.image_url) : PLACEHOLDER.gallery
  return (
    <Section style={{ padding: '120px 0' }}>
      <div ref={ref} style={{ padding: '0 80px', marginBottom: 48, maxWidth: 1280, margin: '0 auto 48px' }}
        className="gallery-header">
        <SectionLabel text="Behind The Scenes" />
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, margin: 0 }}>In The Making</h2>
      </div>
      <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="gallery-grid"
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: 3, maxHeight: 700, overflow: 'hidden', padding: '0 80px' }}>
        {srcs.map((src, i) => (
          <motion.div key={i} variants={fadeUp}
            style={{ gridColumn: i === 0 ? '1' : 'auto', gridRow: i === 0 ? '1 / 3' : 'auto', overflow: 'hidden', background: '#2d2c30', minHeight: i === 0 ? 500 : 240 }}>
            <img src={src} alt={`Behind the scenes ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}
