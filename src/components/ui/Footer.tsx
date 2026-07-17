import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="footer" style={{ background: '#1A191C', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '80px 80px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 80 }}>
          <div>
            <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 1, marginBottom: 6 }}>THE ARTAINMENT</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, color: '#F7BB0E', letterSpacing: 4, fontStyle: 'italic', marginBottom: 24 }}>Art of Film</div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.4)', maxWidth: 280, margin: '0 0 32px' }}>Kenya's premier creative media company. Creating, producing and showcasing African stories and talent.</p>
          </div>
          {[
            { title: 'Platform', links: [{ label: 'Films', path: '/films' }, { label: 'Productions', path: '/productions' }, { label: 'Talent', path: '/talent' }] },
            { title: 'Services', links: [{ label: 'All Services', path: '/services' }, { label: 'Contact', path: '/contact' }] },
            { title: 'Company', links: [{ label: 'About Us', path: '/about' }, { label: 'Contact', path: '/contact' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>{col.title}</div>
              {col.links.map(link => (
                <Link key={link.label + link.path} to={link.path}
                  style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', padding: '6px 0', textDecoration: 'none', transition: 'color 0.2s' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} The Artainment Studios. All rights reserved.</span>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Nairobi, Kenya</span>
        </div>
      </div>
    </footer>
  )
}
