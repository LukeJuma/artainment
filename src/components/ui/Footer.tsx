import { Link } from 'react-router-dom'
import { LogoFooter } from './Logo'

export function Footer() {
  return (
    <footer style={{ background: '#111', borderTop: 'none', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 5vw, 80px) 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <LogoFooter height={32} />
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', maxWidth: 280, marginTop: 16 }}>Kenya's premier creative media company. Creating, producing and showcasing African stories and talent.</p>
          </div>
          {[
            { title: 'Platform', links: [{ label: 'Films', path: '/films' }, { label: 'Productions', path: '/productions' }, { label: 'Talent', path: '/talent' }] },
            { title: 'Services', links: [{ label: 'All Services', path: '/services' }, { label: 'Contact', path: '/contact' }] },
            { title: 'Mic Mtaani', links: [{ label: 'Local News', path: '/micmtaani' }, { label: 'Events', path: '/micmtaani/events' }, { label: 'Businesses', path: '/micmtaani/businesses' }] },
            { title: 'Company', links: [{ label: 'About Us', path: '/about' }, { label: 'Careers', path: '/about' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
              {col.links.map(link => (
                <Link key={link.label + link.path} to={link.path}
                  style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)', padding: '6px 0', textDecoration: 'none', transition: 'color 0.2s', minHeight: 32 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >{link.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>&copy; {new Date().getFullYear()} The Artainment Studios. All rights reserved.</span>
          <span style={{ fontFamily: 'Domine, serif', fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Nairobi, Kenya</span>
        </div>
      </div>
    </footer>
  )
}
