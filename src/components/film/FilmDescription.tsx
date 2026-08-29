import type { Film } from '../../lib/api'
import { FadeIn } from '../ui/FadeIn'
import { SectionLabel } from '../ui/SectionLabel'

export function FilmDescription({ film }: { film: Film }) {
  if (!film.synopsis || film.synopsis.length <= 220) return null

  return (
    <section className="section-pad" style={{ background: 'var(--bg-muted)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeIn>
          <SectionLabel text="The story" />
          <h2 className="section-heading" style={{ margin: '0 0 24px' }}>About {film.title}</h2>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 17, lineHeight: 1.9,
            color: 'var(--text-secondary)', maxWidth: 820, margin: 0,
          }}>
            {film.synopsis}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
