import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mmAPI } from '../../lib/api'

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
    } catch {
      setMsg('Already subscribed or error.')
    }
  }

  return (
    <footer style={{ background: '#111', color: '#ccc', marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>MIC MTAANI</h3>
            <p style={{ fontSize: 12, color: '#F00000', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 12px' }}>Nakuru Local News</p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#999', margin: 0 }}>
              Your trusted source for community news, events, and stories from Nakuru County and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'All News', path: '/micmtaani/news' },
                { label: 'Events', path: '/micmtaani/events' },
                { label: 'Local Businesses', path: '/micmtaani/businesses' },
                { label: 'Submit a Story', path: '/micmtaani/submit' },
                { label: 'Search', path: '/micmtaani/search' },
              ].map(link => (
                <Link key={link.path} to={link.path} style={{ fontSize: 13, color: '#999', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F00000')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#999')}
                >{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Newsletter</h4>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 12px', lineHeight: 1.5 }}>Get daily or weekly updates from Nakuru.</p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Your email" style={{
                  padding: '8px 12px', borderRadius: 6, border: '1px solid #333',
                  background: '#222', color: '#fff', fontSize: 13, outline: 'none',
                }} />
              <button type="submit" style={{
                padding: '8px 0', borderRadius: 6, border: 'none',
                background: '#F00000', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Subscribe</button>
            </form>
            {msg && <p style={{ fontSize: 12, color: '#F7BB0E', marginTop: 8 }}>{msg}</p>}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#999' }}>
              <span>Nakuru, Kenya</span>
              <a href="mailto:news@micmtaani.co.ke" style={{ color: '#F00000', textDecoration: 'none' }}>news@micmtaani.co.ke</a>
              <a href="tel:+254700000000" style={{ color: '#ccc', textDecoration: 'none' }}>+254 700 000 000</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #333', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>&copy; {new Date().getFullYear()} Mic Mtaani. A division of The Artainment.</p>
          <Link to="/" style={{ fontSize: 11, color: '#666', textDecoration: 'none' }}>Back to The Artainment &rarr;</Link>
        </div>
      </div>
    </footer>
  )
}
