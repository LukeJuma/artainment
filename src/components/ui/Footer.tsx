import { Link } from 'react-router-dom'
import { LogoFooter } from './Logo'
import { IconYouTube, IconFacebook, IconTikTok, IconInstagram } from './Icons'

const SOCIAL_LINKS = [
  { label: 'YouTube', href: 'https://youtube.com/@theartainment', icon: IconYouTube },
  { label: 'Facebook', href: 'https://facebook.com/theartainment', icon: IconFacebook },
  { label: 'TikTok', href: 'https://tiktok.com/@theartainment', icon: IconTikTok },
  { label: 'Instagram', href: 'https://instagram.com/theartainment', icon: IconInstagram },
]

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
            { title: 'Platform', links: [{ label: 'Movies', path: '/films' }, { label: 'Series', path: '/series' }, { label: 'Podcasts', path: '/podcasts' }] },
            { title: 'People', links: [{ label: 'Actors', path: '/actors' }, { label: 'Contact', path: '/contact' }] },
            { title: 'Mic Mtaani', links: [{ label: 'Local News', path: '/micmtaani' }, { label: 'Events', path: '/micmtaani/events' }, { label: 'Businesses', path: '/micmtaani/businesses' }] },
            { title: 'Company', links: [{ label: 'About Us', path: '/about' }] },
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
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {SOCIAL_LINKS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', transition: 'color 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              ><s.icon size={15} /></a>
            ))}
          </div>
          <span style={{ fontFamily: 'Domine, serif', fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Nairobi, Kenya</span>
        </div>
      </div>
    </footer>
  )
}
