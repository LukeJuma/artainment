import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { IconSearch, IconSun, IconMoon, IconX, IconMenu } from '../ui/Icons'
import { Logo } from '../ui/Logo'

export function MMNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
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
      background: 'var(--bg)', borderBottom: '2px solid var(--red)',
      padding: '0 16px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Link to="/micmtaani" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo type="micmtaani" height={28} />
        </Link>

        <div className="mm-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {mmLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
              color: 'var(--text-secondary)', textDecoration: 'none', letterSpacing: 0.5,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >{link.label}</Link>
          ))}

          <button onClick={() => setSearchOpen(!searchOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: 'var(--text-secondary)', minHeight: 48, minWidth: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconSearch size={18} color="var(--text-secondary)" />
          </button>

          <button onClick={toggleTheme} style={{
            background: 'none', border: '1.5px solid var(--border)', borderRadius: 20,
            width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text)', transition: 'all 0.2s',
          }}>
            {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>

          <Link to="/" style={{
            fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none',
            borderLeft: '1px solid var(--border)', paddingLeft: 16,
          }}>The Artainment</Link>
        </div>

        <button className="mm-nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8,
          minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center',
        }}>
          {menuOpen ? <IconX size={22} color="var(--text)" /> : <IconMenu size={22} color="var(--text)" />}
        </button>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <form onSubmit={handleSearch} style={{ padding: '0 0 12px', display: 'flex', gap: 8, maxWidth: 1200, margin: '0 auto' }}>
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search..." autoFocus
                style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 16, outline: 'none', minHeight: 44 }} />
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Search</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mm-nav-mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {mmLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)} style={{
                  fontSize: 16, fontWeight: 600, color: 'var(--text)', textDecoration: 'none',
                  padding: '14px 0', minHeight: 48, display: 'flex', alignItems: 'center',
                }}>{link.label}</Link>
              ))}
              <button onClick={() => { toggleTheme(); setMenuOpen(false) }} style={{
                background: 'none', border: 'none', fontSize: 14, color: 'var(--text-secondary)',
                cursor: 'pointer', textAlign: 'left', padding: '14px 0', minHeight: 48,
                display: 'flex', alignItems: 'center',
              }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link to="/" onClick={() => setMenuOpen(false)} style={{
                fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
                padding: '14px 0', minHeight: 48, display: 'flex', alignItems: 'center',
              }}>The Artainment</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
