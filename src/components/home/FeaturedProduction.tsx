import { type Film, type Series } from '../../lib/api'
import { useInView } from '../../lib/animations'
import { Section } from '../ui/Section'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { MediaArt } from '../ui/MediaArt'
import { IconPlay, IconStar } from '../ui/Icons'

export function FeaturedProduction({ film, kind = 'film' }: { film: Film | Series | null; kind?: 'film' | 'series' }) {
  const { ref } = useInView()
  if (!film) return null

  const isSeries = kind === 'series'
  const detailPath = `/${isSeries ? 'series' : 'movies'}/${film.slug}`

  return (
    <Section style={{ padding: 0, marginBottom: 0, overflow: 'hidden', background: 'var(--ds-ink-950)' }}>
      <div ref={ref} className="featured" style={{ position: 'relative', minHeight: 520 }}>
        <div style={{ position: 'absolute', inset: 0, height: 520 }}>
          <MediaArt type={isSeries ? 'series' : 'film'} title={film.title} src={film.backdrop_url || film.poster_url} alt={film.title} />
        </div>
        <div className="featured-content" style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-left)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(48px, 7vh, 88px) clamp(24px, 6vw, 96px)', maxWidth: 860 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ width: 32, height: 2, background: 'var(--ds-gold)' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3.5, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              Featured {isSeries ? 'Series' : 'Production'}
            </span>
          </div>
          <h2 className="section-heading" style={{ color: '#fff', margin: '0 0 18px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(44px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '0.005em' }}>
            {film.title}
          </h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {isSeries ? <Badge variant="brand">Series</Badge> : <Badge variant="brand">Film</Badge>}
            {film.tag && <Badge variant="muted">{film.tag}</Badge>}
            {film.genre && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {film.genre}
              </span>
            )}
            {film.year && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5 }}>
                · {film.year}
              </span>
            )}
            {typeof film.rating === 'number' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--ds-gold)', fontWeight: 700 }}>
                <IconStar size={14} color="var(--ds-gold)" filled /> {film.rating.toFixed(1)}
              </span>
            )}
          </div>
          {film.synopsis && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', maxWidth: 520, margin: '0 0 34px' }}>
              {film.synopsis.length > 180 ? film.synopsis.slice(0, 180) + '...' : film.synopsis}
            </p>
          )}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button to={detailPath} variant="primary" size="lg">
              <IconPlay size={14} color="#fff" /> Watch Now
            </Button>
            <Button to={isSeries ? '/series' : '/movies'} variant="light" size="lg">
              {isSeries ? 'More Series' : 'More Films'}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
