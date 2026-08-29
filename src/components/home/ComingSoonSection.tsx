import { useEffect, useState } from 'react'
import { type Film } from '../../lib/api'
import { contactAPI } from '../../lib/api'
import { Logo } from '../ui/Logo'
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

  const countdown = [
    { label: 'Days', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hrs', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Mins', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Secs', value: String(timeLeft.seconds).padStart(2, '0') },
  ]

  const socials = [
    { label: 'Facebook', icon: IconFacebook },
    { label: 'Twitter', icon: IconTwitter },
    { label: 'Instagram', icon: IconInstagram },
    { label: 'YouTube', icon: IconYouTube },
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
    <section className="cs-section" aria-label="Coming soon">
      <div className="cs-bg" aria-hidden="true">
        {art ? <img src={art} alt="" /> : <div className="cs-bg-fallback" />}
        <div className="cs-overlay" />
      </div>

      <div className="cs-content">
        <div className="cs-brand" aria-label="Branding">
          <Logo type="artainment" light height={46} />
          <div className="cs-brand-text">THE ARTAINMENT</div>
        </div>

        <h2 className="cs-title">COMING SOON</h2>

        <div className="cs-film">
          <div className="cs-film-kicker">Up Next</div>
          <div className="cs-film-title">{film.title}</div>
          <div className="cs-film-meta">
            {film.tag && <span>{film.tag}</span>}
            {film.tag && (film.genre || film.year) && <span className="cs-film-sep">·</span>}
            {film.genre && <span>{film.genre}</span>}
            {film.genre && film.year && <span className="cs-film-sep">·</span>}
            {film.year && <span>{film.year}</span>}
          </div>
        </div>

        <div className="cs-countdown" aria-label="Countdown timer">
          {countdown.map((item) => (
            <div key={item.label} className="cs-countdown-card">
              <div className="cs-countdown-number">{item.value}</div>
              <div className="cs-countdown-label">{item.label}</div>
            </div>
          ))}
        </div>

        <form className="cs-signup" onSubmit={handleSubscribe}>
          <input
            type="email"
            aria-label="Email address"
            placeholder="ENTER YOUR EMAIL HERE"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={subStatus === 'loading'}>
            {subStatus === 'loading' ? 'SUBSCRIBING...' : 'NOTIFY ME'}
          </button>
        </form>

        {subMessage && (
          <div
            style={{
              fontFamily: 'DM Sans',
              fontSize: 13,
              letterSpacing: 0.5,
              marginTop: 14,
              color: subStatus === 'error' ? '#ff8f8f' : 'var(--text-secondary, #c8c8c8)',
            }}
          >
            {subMessage}
          </div>
        )}

        <div className="cs-socials" aria-label="Social media links">
          {socials.map(({ label, icon: Icon }) => (
            <a key={label} href="#" aria-label={label} title={label}>
              <Icon size={14} color="#F4E5B6" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
