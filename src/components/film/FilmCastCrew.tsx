import { useReducedMotion } from 'framer-motion'
import type { CastPerson, Film } from '../../lib/api'
import { FadeIn, FadeInStagger } from '../ui/FadeIn'
import { SectionLabel } from '../ui/SectionLabel'

export function FilmCastCrew({ film }: { film: Film }) {
  const reduced = useReducedMotion()
  const c = film.cast
  const cast = (c?.cast || []).filter((m): m is string | CastPerson => Boolean(m))

  const crew: { label: string; value: string }[] = []
  const add = (label: string, value?: string) => { if (value?.trim()) crew.push({ label, value: value.trim() }) }
  add('Director', c?.director)
  add('Producer', c?.producer)
  add('Writer', c?.writer)
  add('Cinematographer', c?.cinematographer)
  add('Editor', c?.editor)

  if (cast.length === 0 && crew.length === 0) return null

  return (
    <section className="section-pad" style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeIn>
          <SectionLabel text="The film" />
          <h2 className="section-heading" style={{ margin: '0 0 16px' }}>Cast & Crew</h2>
          <p className="section-subheading" style={{ margin: 0 }}>The talent behind the story.</p>
        </FadeIn>

        {cast.length > 0 && (
          <div style={{ marginTop: 'clamp(36px, 5vw, 56px)' }}>
            {reduced ? (
              <div className="cc-grid">
                {cast.map((p, i) => <CastCard key={i} person={p} />)}
              </div>
            ) : (
              <FadeInStagger className="cc-grid" staggerDelay={0.07}>
                {cast.map((p, i) => <CastCard key={i} person={p} />)}
              </FadeInStagger>
            )}
          </div>
        )}

        {crew.length > 0 && (
          <div className="cc-crew-wrap">
            <FadeIn>
              <SectionLabel text="Crew" />
              <div className="cc-crew-grid">
                {crew.map(m => (
                  <div key={m.label}>
                    <div className="cc-crew-role">{m.label}</div>
                    <div className="cc-crew-name">{m.value}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </section>
  )
}

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')
}

function CastCard({ person }: { person: string | CastPerson }) {
  const isObject = typeof person === 'object'
  const name = isObject ? person.name : person
  const image = isObject ? (person.image_url || null) : null
  const isChar = isObject && Boolean(person.character)
  const sub = isObject ? (isChar ? `as ${person.character}` : (person.role || 'Actor')) : 'Actor'
  const initials = initialsOf(name)

  return (
    <article className="cc-card">
      <div className="cc-portrait">
        {image ? (
          <img className="cc-img" src={image} alt={name} loading="lazy" />
        ) : (
          <div className="cc-fallback" role="img" aria-label={`Portrait of ${name}`}>
            <div className="cc-fallback-light" />
            <svg className="cc-fallback-silhouette" viewBox="0 0 200 220" aria-hidden="true">
              <ellipse cx="100" cy="72" rx="36" ry="42" fill="currentColor" />
              <path d="M100 120c-44 0-72 26-78 62-3 16 7 34 22 34h112c15 0 25-18 22-34-6-36-34-62-78-62z" fill="currentColor" />
            </svg>
            <span className="cc-fallback-initials">{initials}</span>
          </div>
        )}
        <div className="cc-overlay" />
        <div className="cc-ring" />
      </div>
      <div className="cc-info">
        <h3 className="cc-name">{name}</h3>
        <p className={isChar ? 'cc-role cc-role-char' : 'cc-role'}>{sub}</p>
      </div>
    </article>
  )
}
