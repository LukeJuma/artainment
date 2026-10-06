import { useEffect, useState } from 'react'
import { type Film } from '../../lib/api'
import { contactAPI } from '../../lib/api'
import { responsive, imgFallback, imgTransformOk } from '../../lib/images'
import { Badge } from '../ui/Badge'
import { Calendar, Mail, ArrowRight } from 'lucide-react'

const FALLBACK_TARGET = Date.now() + (61 * 24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000) + (27 * 60 * 1000) + 4000

function countdownTarget(film: Film): number {
  if (film.release_date) {
    const target = new Date(film.release_date).getTime()
    if (!Number.isNaN(target)) return target
  }
  return FALLBACK_TARGET
}

function getCountdown(target: number) {
  const diff = Math.max(target - Date.now(), 0)
  const totalSeconds = Math.floor(diff / 1000)

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

const LOBBY_AVATARS = [
  { initials: 'NK', bg: '#e11d48' },
  { initials: 'AM', bg: '#d4a24e' },
  { initials: 'JM', bg: '#1c1c22' },
]

export function ComingSoonSection({ films }: { films: Film[] }) {
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(getCountdown(FALLBACK_TARGET))
  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [subMessage, setSubMessage] = useState('')

  useEffect(() => {
    if (films.length < 2) return

    const timer = setInterval(() => setCurrent((i) => (i + 1) % films.length), 9000)
    return () => clearInterval(timer)
  }, [films.length])

  useEffect(() => {
    if (!films.length) return
    const timer = setInterval(() => setTimeLeft(getCountdown(countdownTarget(films[current % films.length]))), 1000)
    return () => clearInterval(timer)
  }, [films, current])

  if (!films.length) return null

  const film = films[current % films.length]
  const poster = film.poster_url || film.backdrop_url

  const premiereDate = film.release_date ? new Date(film.release_date) : null
  const premiereValid = premiereDate && !Number.isNaN(premiereDate.getTime())
  const premiereLabel = premiereValid
    ? premiereDate!.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const daysToGo = premiereValid
    ? Math.max(0, Math.ceil((premiereDate!.getTime() - Date.now()) / 86400000))
    : null

  const countdown = [
    { label: 'Days', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hrs', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Min', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Sec', value: String(timeLeft.seconds).padStart(2, '0') },
  ]

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubStatus('loading')
    setSubMessage('')
    try {
      const res = await contactAPI.subscribe(email.trim())
      setSubStatus('success')
      setSubMessage(res.message || 'You are on the list - watch your inbox.')
      setEmail('')
    } catch (e: any) {
      setSubStatus('error')
      setSubMessage(e.message || 'Subscription failed. Please try again.')
    }
  }

  return (
    <section aria-label="Coming soon" style={{ background: 'var(--bg)' }}>
      {/* Section header on page background */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 7vw, 84px) clamp(20px, 5vw, 80px) clamp(28px, 4vw, 44px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 28, height: 2, background: 'var(--ds-gold-cta)' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', fontWeight: 700 }}>
            On The Horizon
          </span>
        </div>
        <h2 className="section-heading" style={{ color: 'var(--text)', margin: '0 0 10px' }}>
          Coming Soon
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0, maxWidth: 560 }}>
          Films and series on their way to your screen - premiere dates, countdowns and first-access alerts.
        </p>
      </div>

      {/* Premiere spread */}
      <div style={{ background: 'var(--ds-surface)', borderTop: '1px solid var(--ds-section-line)', borderBottom: '1px solid var(--ds-section-line)' }}>
        <div
          className="cs-spread"
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 80px)',
            display: 'grid', gridTemplateColumns: 'minmax(280px, 400px) 1fr', gap: 'clamp(28px, 5vw, 64px)',
            alignItems: 'start',
          }}
        >
          {/* Poster with caption bar */}
          <div>
            <div style={{
              position: 'relative', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden',
              background: 'linear-gradient(160deg, #1c1224 0%, #0d0d10 100%)',
              border: '1px solid var(--ds-card-line)',
              boxShadow: 'var(--ds-card-shadow)',
            }}>
              {poster ? (
                <img {...responsive(poster)} alt={film.title} loading="lazy" decoding="async" onLoad={imgTransformOk} onError={e => imgFallback(e, poster)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                  {film.title}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 40%)' }} />
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 20px',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 4,
                color: '#fff', textTransform: 'uppercase', textAlign: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              }}>
                Movie Coming Out Soon
              </div>
            </div>
          </div>

          {/* Title block */}
          <div style={{ paddingTop: 4, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <Badge variant="upcoming">Up Next</Badge>
              {film.status === 'in_production' && <Badge variant="live">Filming Now</Badge>}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'var(--ds-text-2)', textTransform: 'uppercase' }}>
                {[film.genre, film.year].filter(Boolean).join('  ·  ') || 'Artainment Original'}
              </span>
            </div>

            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, color: 'var(--ds-text)',
              fontSize: 'clamp(64px, 9vw, 124px)', lineHeight: 0.9, margin: '0 0 18px',
              textTransform: 'uppercase', letterSpacing: '0.005em',
            }}>
              {film.title}
            </h3>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.75, color: 'var(--ds-text-2)', maxWidth: 560, margin: '0 0 30px' }}>
              {film.synopsis || 'A new story is on its way to your screen.'}
            </p>

            {/* Slanted ticket panel + countdown */}
            <div className="cs-ticket" style={{ display: 'flex', alignItems: 'stretch', maxWidth: 720, marginBottom: 32 }}>
              <div className="cs-ticket-date" style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <div className="cs-ticket-date-gold" style={{
                  position: 'absolute', inset: '0 0 8px 0', background: 'var(--ds-gold)',
                  clipPath: 'polygon(0 0, 100% 0, calc(100% - 26px) 100%, 0 100%)',
                  borderRadius: '14px 0 0 14px',
                }} />
                <div className="cs-ticket-date-inner" style={{
                  position: 'relative', height: '100%',
                  background: 'var(--ds-brand)',
                  clipPath: 'polygon(0 0, 100% 0, calc(100% - 26px) 100%, 0 100%)',
                  borderRadius: '14px 0 0 14px',
                  padding: '22px 56px 22px 24px',
                  display: 'flex', gap: 16, alignItems: 'center',
                }}>
                  <Calendar size={26} strokeWidth={1.75} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.9)' }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: 4 }}>
                      World Premiere Date
                    </span>
                    <span className="cs-premiere-label" style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      {premiereLabel ?? 'Date to be announced'}
                    </span>
                    <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                      {daysToGo !== null
                        ? (daysToGo > 0 ? `${daysToGo} days until the curtain rises` : 'The curtain rises imminently')
                        : 'Follow this title for the date drop'}
                    </span>
                  </span>
                </div>
              </div>
              <div className="cs-ticket-countdown" style={{
                display: 'flex', gap: 20, padding: '22px 28px', alignItems: 'center', flexWrap: 'wrap',
                background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)', borderLeft: 'none',
                borderRadius: '0 14px 14px 0', marginLeft: -6,
              }}>
                {countdown.map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {i > 0 && <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--ds-card-line)' }} />}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: 'var(--ds-text)', lineHeight: 1 }}>{item.value}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 1.5, color: 'var(--ds-text-3)', textTransform: 'uppercase', marginTop: 4 }}>{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 22, height: 3, borderRadius: 2, background: 'var(--ds-brand)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--ds-text)' }}>
                Be first through the door
              </span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--ds-text-2)', margin: '0 0 14px', maxWidth: 520 }}>
              Premiere alerts, exclusive trailer drops, and VIP ticket info straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 12, maxWidth: 560, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{
                flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)',
                borderRadius: 'var(--ds-radius-pill)', padding: '0 8px 0 20px', minHeight: 52,
              }}>
                <Mail size={16} style={{ opacity: 0.6, flexShrink: 0 }} />
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--ds-text)', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    minHeight: 50, minWidth: 0,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={subStatus === 'loading'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0 30px', borderRadius: 'var(--ds-radius-pill)', border: 'none', cursor: 'pointer',
                  background: 'var(--ds-brand)', color: '#fff',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                  minHeight: 52, boxShadow: 'var(--ds-shadow-glow-brand)',
                  opacity: subStatus === 'loading' ? 0.6 : 1,
                }}
              >
                {subStatus === 'loading' ? 'Joining...' : 'Request Invite'} <ArrowRight size={14} />
              </button>
            </form>
            {subMessage && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: '0 0 14px', color: subStatus === 'error' ? '#ff8f8f' : 'var(--ds-text-2)' }}>
                {subMessage}
              </p>
            )}

            {/* Premiere lobby */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
              <div style={{ display: 'flex' }}>
                {LOBBY_AVATARS.map((a, i) => (
                  <span key={a.initials} style={{
                    width: 32, height: 32, borderRadius: '50%', background: a.bg,
                    border: '2px solid var(--ds-surface)', marginLeft: i === 0 ? 0 : -10,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: '#fff',
                  }}>
                    {a.initials}
                  </span>
                ))}
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--ds-text-2)', textTransform: 'uppercase' }}>
                Join the premiere lobby
              </span>
              <span style={{ fontSize: 14, color: 'var(--ds-text-3)' }}>→</span>
            </div>

            {/* Rotation dots */}
            {films.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 26 }}>
                {films.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setCurrent(i)}
                    aria-label={`Show ${f.title}`}
                    style={{
                      width: i === current % films.length ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: i === current % films.length ? 'var(--ds-brand)' : 'var(--ds-card-line)',
                      transition: 'all 0.3s', minHeight: 8, padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .cs-spread { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .cs-ticket { flex-direction: column !important; max-width: 100% !important; }
          .cs-ticket-date-gold { display: none !important; }
          .cs-ticket-date-inner { clip-path: none !important; border-radius: 14px 14px 0 0 !important; }
          .cs-ticket-countdown { border: 1px solid var(--ds-card-line) !important; border-top: none !important; margin-left: 0 !important; border-radius: 0 0 14px 14px !important; width: 100% !important; }
        }
      `}</style>
    </section>
  )
}
