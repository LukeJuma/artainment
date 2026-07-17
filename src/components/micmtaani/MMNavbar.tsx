import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

export function MMNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQ.length >= 2) {
      navigate(`/micmtaani/search?q=${encodeURIComponent(searchQ)}`)
      setSearchQ('')
      setSearchOpen(false)
    }
  }

  const mmLinks = [
    { label: 'News', path: '/micmtaani/news' },
    { label: 'Events', path: '/micmtaani/events' },
    { label: 'Business', path: '/micmtaani/businesses' },
    { label: 'Submit', path: '/micmtaani/submit' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff', borderBottom: '2px solid #F00000',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        {/* Brand */}
        <Link to="/micmtaani" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#111',
            letterSpacing: -0.5,
          }}>MIC MTAANI</span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#F00000', textTransform: 'uppercase',
            letterSpacing: 2, borderLeft: '2px solid #ddd', paddingLeft: 8,
          }}>Nakuru</span>
        </Link>

        {/* Desktop links */}
        <div className="mm-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {mmLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
              color: '#555', textDecoration: 'none', letterSpacing: 0.5,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F00000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >{link.label}</Link>
          ))}

          {/* Search toggle */}
          <button onClick={() => setSearchOpen(!searchOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#555', fontSize: 18,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>

          {/* Artainment link */}
          <Link to="/" style={{
            fontSize: 11, fontWeight: 500, color: '#999', textDecoration: 'none',
            borderLeft: '1px solid #eee', paddingLeft: 16,
          }}>The Artainment</Link>
        </div>

        {/* Mobile toggle */}
        <button className="mm-nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          <div style={{ width: 20, height: 2, background: '#111', marginBottom: 4, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none' }} />
          <div style={{ width: 20, height: 2, background: '#111', marginBottom: 4, opacity: menuOpen ? 0 : 1, transition: 'all 0.3s' }} />
          <div style={{ width: 20, height: 2, background: '#111', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none' }} />
        </button>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleSearch} style={{ padding: '0 0 12px', display: 'flex', gap: 8, maxWidth: 1200, margin: '0 auto' }}>
              <input
                type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search news, events, businesses..."
                autoFocus
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd',
                  fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <button type="submit" style={{
                padding: '8px 16px', background: '#F00000', color: '#fff', border: 'none',
                borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Search</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mm-nav-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #eee' }}
          >
            <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mmLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)} style={{
                  fontSize: 16, fontWeight: 600, color: '#111', textDecoration: 'none',
                }}>{link.label}</Link>
              ))}
              <Link to="/" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>The Artainment</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
