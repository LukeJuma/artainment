import { useEffect, useState } from 'react'
import { type Film } from '../../lib/api'
import { contactAPI } from '../../lib/api'
import { Badge } from '../ui/Badge'
import { IconFacebook, IconInstagram, IconTwitter, IconYouTube } from '../ui/Icons'

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

export function ComingSoonSection({ films }: { films: Film[] }) {
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(getCountdown(FALLBACK_TARGET))
  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [subMessage, setSubMessage] = useState('')

  useEffect(() => {
    if (films.length < 2) return

    const timer = setInterval(() => setCurrent((i) => (i + 1) % films.length), 8000)
    return () => clearInterval(timer)
  }, [films.length])

  useEffect(() => {
    if (!films.length) return
    const timer = setInterval(() => setTimeLeft(getCountdown(countdownTarget(films[current % films.length]))), 1000)
    return () => clearInterval(timer)
  }, [films, current])

  if (!films.length) return null

  const film = films[current % films.length]
  const art = film.backdrop_url || film.poster_url

  const premiereDate = film.release_date ? new Date(film.release_date) : null
  const premiereValid = premiereDate && !Number.isNaN(premiereDate.getTime())
  const premiereLabel = premiereValid
    ? premiereDate!.toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const daysToGo = premiereValid
    ? Math.max(0, Math.ceil((premiereDate!.getTime() - Date.now()) / 86400000))
    : null

  const countdown = [
    { label: 'Days', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hrs', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Mins', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Secs', value: String(timeLeft.seconds).padStart(2, '0') },
  ]

  const socials = [
    { label: 'Facebook', icon: IconFacebook, url: 'https://facebook.com/theartainment' },
    { label: 'Twitter', icon: IconTwitter, url: 'https://twitter.com/theartainment' },
    { label: 'Instagram', icon: IconInstagram, url: 'https://instagram.com/theartainment' },
    { label: 'YouTube', icon: IconYouTube, url: 'https://youtube.com/@theartainment' },
  ]

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubStatus('loading')
    setSubMessage('')
    try {
      const res = await contactAPI.subscribe(email.trim())
      setSubStatus('success')
      setSubMessage(res.message || 'Successfully subscribed to our newsletter.')
      setEmail('')
    } catch (e: any) {
      setSubStatus('error')
      setSubMessage(e.message || 'Subscription failed. Please try again.')
    }
  }

  return (
    <section aria-label="Coming soon" style={{ background: 'var(--bg)' }}>
      {/* Section header on page background — not overlaid on the artwork */}
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

      {/* Full-bleed artwork band */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--ds-ink-950)' }}>
      {/* Backdrop */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        {art ? (
          <img src={art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1a0f14 0%, #0d0d0f 60%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-left)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)', opacity: 0.7 }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto',
        padding: 'clamp(56px, 8vw, 110px) clamp(20px, 5vw, 80px)',
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, color: '#fff',
          fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: 1, margin: '0 0 12px',
          textTransform: 'uppercase', letterSpacing: '0.01em', maxWidth: 800,
        }}>
          {film.title}
        </h2>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <Badge variant="upcoming">Up Next</Badge>
          {film.status === 'in_production' && <Badge variant="live">Filming Now</Badge>}
          {film.tag && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{film.tag}</span>}
          {film.genre && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>· {film.genre}</span>}
          {film.year && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>· {film.year}</span>}
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', maxWidth: 460, margin: '0 0 8px' }}>
          {film.synopsis ? (film.synopsis.length > 140 ? film.synopsis.slice(0, 140) + '...' : film.synopsis) : 'A new story is on its way to your screen.'}
        </p>

        {/* Premiere status line — tells the visitor exactly what's happening */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--ds-gold)', margin: '0 0 28px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ds-gold)', display: 'inline-block', animation: 'ds-pulse-dot 1.6s ease-in-out infinite' }} />
          {premiereLabel
            ? `Premieres ${premiereLabel}${daysToGo !== null && daysToGo > 0 ? ` — ${daysToGo} day${daysToGo === 1 ? '' : 's'} to go` : ' — almost here'}`
            : 'Premiere date to be announced — follow this title for updates'}
        </p>

        {/* Countdown */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>
          Countdown to premiere
        </p>
        <div aria-label="Countdown timer" style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {countdown.map(item => (
            <div key={item.label} style={{
              minWidth: 84, textAlign: 'center', padding: '14px 12px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--ds-radius-md)', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: '#fff', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ds-gold)', marginTop: 6 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Notify form */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px', maxWidth: 460 }}>
          Be first through the door — premiere alert, trailer drop and ticket info, straight to your inbox.
        </p>
        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10, maxWidth: 460, flexWrap: 'wrap' }}>
          <input
            type="email"
            aria-label="Email address"
            placeholder="Email for premiere alerts"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              flex: '1 1 220px', padding: '13px 20px', borderRadius: 'var(--ds-radius-pill)',
              border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.45)',
              color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
              minHeight: 48,
            }}
          />
          <button
            type="submit"
            disabled={subStatus === 'loading'}
            style={{
              padding: '13px 28px', borderRadius: 'var(--ds-radius-pill)', border: 'none', cursor: 'pointer',
              background: 'var(--ds-gold)', color: '#1a1206',
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              minHeight: 48, boxShadow: 'var(--ds-shadow-glow-gold)',
              opacity: subStatus === 'loading' ? 0.6 : 1,
            }}
          >
            {subStatus === 'loading' ? 'Joining...' : 'Notify Me'}
          </button>
        </form>
        {subMessage && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginTop: 12, color: subStatus === 'error' ? '#ff8f8f' : 'rgba(255,255,255,0.75)' }}>
            {subMessage}
          </p>
        )}

        {/* Socials */}
        <div aria-label="Social media links" style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {socials.map(({ label, icon: Icon, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              style={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)', color: 'var(--ds-gold)',
                transition: 'all var(--ds-dur-fast) var(--ds-ease-out)',
              }}
            >
              <Icon size={15} color="currentColor" />
            </a>
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
