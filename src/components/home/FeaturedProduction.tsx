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
  const detailPath = `/${isSeries ? 'series' : 'films'}/${film.slug}`

  return (
    <Section style={{ padding: 0, marginBottom: 'clamp(48px, 6vw, 88px)', overflow: 'hidden', background: 'var(--ds-ink-950)' }}>
      <div ref={ref} className="featured" style={{ position: 'relative', minHeight: 520 }}>
        <div style={{ position: 'absolute', inset: 0, height: 520 }}>
          <MediaArt type={isSeries ? 'series' : 'film'} title={film.title} src={film.backdrop_url || film.poster_url} alt={film.title} />
        </div>
        <div className="featured-content" style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-left)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(20px, 5vw, 80px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 28, height: 2, background: 'var(--ds-gold)' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              Featured {isSeries ? 'Series' : 'Production'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {isSeries && <Badge variant="brand">Series</Badge>}
            {film.tag && <Badge variant="muted">{film.tag}</Badge>}
            {film.genre && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {film.genre}
              </span>
            )}
            {film.year && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>
                {film.year}
              </span>
            )}
            {typeof film.rating === 'number' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--ds-gold)', fontWeight: 700 }}>
                <IconStar size={13} color="var(--ds-gold)" filled /> {film.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h2 className="section-heading" style={{ color: '#fff', margin: '0 0 14px', fontFamily: "'Chonburi', cursive", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 72px)', lineHeight: 1 }}>
            {film.title}
          </h2>
          {film.synopsis && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', maxWidth: 460, margin: '0 0 28px' }}>
              {film.synopsis.length > 160 ? film.synopsis.slice(0, 160) + '...' : film.synopsis}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button to={detailPath} variant="primary">
              <IconPlay size={14} color="#fff" /> Watch Now
            </Button>
            <Button to={isSeries ? '/series' : '/films'} variant="light">
              {isSeries ? 'More Series' : 'More Films'}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
