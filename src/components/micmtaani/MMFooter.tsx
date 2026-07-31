import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mmAPI } from '../../lib/api'
import { Logo } from '../ui/Logo'

export function MMFooter() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await mmAPI.subscribe(email)
      setMsg('Subscribed successfully!')
      setEmail('')
    } catch { setMsg('Already subscribed or error.') }
  }

  return (
    <footer style={{ background: 'var(--bg-muted)', borderTop: '1px solid var(--border)', marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
          <div>
            <Logo type="micmtaani" height={24} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>Your trusted source for community news, events, and stories from Nakuru County.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[{ label: 'All News', path: '/micmtaani/news' }, { label: 'Events', path: '/micmtaani/events' }, { label: 'Businesses', path: '/micmtaani/businesses' }, { label: 'Submit a Story', path: '/micmtaani/submit' }].map(link => (
                <Link key={link.path} to={link.path} style={{
                  fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
                  transition: 'color 0.2s', minHeight: 36, padding: '6px 0',
                  display: 'flex', alignItems: 'center',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Newsletter</h4>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Your email"
                style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 16, outline: 'none', minHeight: 44 }} />
              <button type="submit" style={{ padding: '10px 0', borderRadius: 6, border: 'none', background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Subscribe</button>
            </form>
            {msg && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{msg}</p>}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>Nakuru, Kenya</span>
              <a href="mailto:news@micmtaani.co.ke" style={{ color: 'var(--red)', textDecoration: 'none' }}>news@micmtaani.co.ke</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>&copy; {new Date().getFullYear()} Mic Mtaani. A division of The Artainment.</p>
          <Link to="/" style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', minHeight: 36, display: 'inline-flex', alignItems: 'center' }}>Back to The Artainment</Link>
        </div>
      </div>
    </footer>
  )
}
