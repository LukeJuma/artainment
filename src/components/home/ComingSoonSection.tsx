import { useEffect, useState } from 'react'
import { type Film } from '../../lib/api'
import { contactAPI } from '../../lib/api'
import { Badge } from '../ui/Badge'

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
  { initials: 'NK', bg: 'linear-gradient(135deg, #e11d48, #7c2d12)' },
  { initials: 'AW', bg: 'linear-gradient(135deg, #d4a24e, #7c2d12)' },
  { initials: 'JM', bg: 'linear-gradient(135deg, #3b82f6, #1e1b4b)' },
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
      setSubMessage(res.message || 'You are on the list — watch your inbox.')
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
          Films and series on their way to your screen — premiere dates, countdowns and first-access alerts.
        </p>
      </div>

      {/* Premiere-access spread */}
      <div style={{ background: '#0b0b0d' }}>
        <div
          className="cs-spread"
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 80px)',
            display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: 'clamp(28px, 5vw, 64px)',
            alignItems: 'start',
          }}
        >
          {/* Poster with tilted premiere ribbon */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden',
              background: 'linear-gradient(160deg, #1c1224 0%, #0d0d10 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            }}>
              {poster ? (
                <img src={poster} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                  {film.title}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)' }} />
            </div>
            <div style={{
              position: 'absolute', left: '50%', bottom: -14, transform: 'translateX(-50%) rotate(-3deg)',
              background: 'var(--ds-gold)', color: '#1a1206',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1.5,
              padding: '7px 22px', borderRadius: 3, whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              PREMIERE ACCESS
            </div>
          </div>

          {/* Title block */}
          <div style={{ paddingTop: 4, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <Badge variant="upcoming">Up Next</Badge>
              {film.status === 'in_production' && <Badge variant="live">Filming Now</Badge>}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: 'var(--ds-gold)', textTransform: 'uppercase' }}>
                {[film.genre, film.year].filter(Boolean).join(' · ') || 'Artainment Original'}
              </span>
            </div>

            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, color: 'var(--ds-gold)',
              fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.95, margin: '0 0 16px',
              textTransform: 'uppercase', letterSpacing: '0.01em',
            }}>
              {film.title}
            </h3>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)', maxWidth: 560, margin: '0 0 28px' }}>
              {film.synopsis || 'A new story is on its way to your screen.'}
            </p>

            {/* Ticket panel */}
            <div style={{
              display: 'flex', gap: 0, maxWidth: 640, marginBottom: 30,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{ flex: 1, padding: '20px 22px', minWidth: 0 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--ds-gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                  World Premiere Date
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  {premiereLabel ?? 'Date to be announced'}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--ds-gold)' }}>
                  {daysToGo !== null
                    ? (daysToGo > 0 ? `${daysToGo} day${daysToGo === 1 ? '' : 's'} until the curtain rises` : 'The curtain rises imminently')
                    : 'Follow this title for the date drop'}
                </div>
              </div>
              <div style={{ width: 1, backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25) 55%, transparent 45%)', backgroundSize: '1px 10px', margin: '16px 0' }} />
              <div style={{ display: 'flex', gap: 18, padding: '20px 24px', alignItems: 'center' }}>
                {countdown.map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 1.5, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginTop: 4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite */}
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
              Be first through the door
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '0 0 14px', maxWidth: 480 }}>
              Premiere alerts, exclusive trailer drops, and VIP ticket info straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10, maxWidth: 480, flexWrap: 'wrap', marginBottom: 14 }}>
              <input
                type="email"
                aria-label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  flex: '1 1 200px', padding: '12px 18px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)',
                  color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
                  minHeight: 46,
                }}
              />
              <button
                type="submit"
                disabled={subStatus === 'loading'}
                style={{
                  padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'var(--ds-gold)', color: '#1a1206',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  minHeight: 46, boxShadow: 'var(--ds-shadow-glow-gold)',
                  opacity: subStatus === 'loading' ? 0.6 : 1,
                }}
              >
                {subStatus === 'loading' ? 'Joining...' : '✉ Request Invite'}
              </button>
            </form>
            {subMessage && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: '0 0 14px', color: subStatus === 'error' ? '#ff8f8f' : 'rgba(255,255,255,0.75)' }}>
                {subMessage}
              </p>
            )}

            {/* Premiere lobby */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', maxWidth: 480 }}>
              <div style={{ display: 'flex' }}>
                {LOBBY_AVATARS.map((a, i) => (
                  <span key={a.initials} style={{
                    width: 30, height: 30, borderRadius: '50%', background: a.bg,
                    border: '2px solid #0b0b0d', marginLeft: i === 0 ? 0 : -10,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: '#fff',
                  }}>
                    {a.initials}
                  </span>
                ))}
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--ds-gold)', textTransform: 'uppercase' }}>
                Join the premiere lobby
              </span>
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
                      background: i === current % films.length ? 'var(--ds-gold)' : 'rgba(255,255,255,0.3)',
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
      `}</style>
    </section>
  )
}
