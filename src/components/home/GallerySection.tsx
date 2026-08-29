import { motion } from 'framer-motion'
import { type GalleryImage } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const { ref, inView } = useInView()

  if (!images.length) return null

  return (
    <Section style={{ background: 'var(--bg-muted)', borderTop: '1px solid var(--border)' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="gallery-header" style={{ marginBottom: 28 }}>
          <SectionLabel text="Behind The Scenes" />
          <h2 className="section-heading" style={{ color: 'var(--text)', margin: 0 }}>Our Gallery</h2>
        </div>
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 180, gap: 8, maxHeight: 560 }}>
          {images.slice(0, 6).map((img, i) => (
            <motion.div key={img.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08 }}
              style={{
                borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                ...(i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
              }}>
              <img src={img.image_url} alt={img.caption || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
