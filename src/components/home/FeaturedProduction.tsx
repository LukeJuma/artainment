import { Link } from 'react-router-dom'
import { type Film } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { SectionLabel } from '../ui/SectionLabel'
import { MediaArt } from '../ui/MediaArt'
import { IconPlay, IconStar } from '../ui/Icons'

export function FeaturedProduction({ film }: { film: Film | null }) {
  const { ref } = useInView()
  if (!film) return null

  return (
    <Section style={{ padding: 0, marginBottom: 'clamp(48px, 6vw, 88px)', overflow: 'hidden', background: 'var(--bg-muted)' }}>
      <div ref={ref} className="featured" style={{ position: 'relative', minHeight: 500 }}>
        <div style={{ position: 'absolute', inset: 0, height: 500 }}>
          <MediaArt type="film" title={film.title} src={film.backdrop_url || film.poster_url} alt={film.title} />
        </div>
        <div className="featured-content" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--bg) 30%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(16px, 5vw, 80px)' }}>
          <SectionLabel text="Featured Production" />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {film.tag && <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 600, background: 'var(--red)', color: '#fff', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{film.tag}</span>}
            <span style={{ fontFamily: 'DM Sans', fontSize: 10, border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase' }}>{film.genre}</span>
          </div>
          <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 12px', fontFamily: 'Chonburi', fontWeight: 400, fontSize: 'clamp(28px, 5vw, 72px)' }}>{film.title}</h2>
          {film.synopsis && <p style={{ fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 0 24px' }}>{film.synopsis.slice(0, 150)}...</p>}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to={`/films/${film.slug}`} className="btn-red"><IconPlay size={14} color="#fff" /> Watch Now</Link>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'DM Sans', fontSize: 14, color: 'var(--red)', fontWeight: 700 }}><IconStar size={14} color="var(--red)" /> {film.rating}</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
