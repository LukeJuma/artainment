import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Logo } from './Logo'
import { IconSun, IconMoon, IconMenu, IconX } from './Icons'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { label: 'Films', path: '/films' },
    { label: 'Services', path: '/services' },
    { label: 'Talent', path: '/talent' },
    { label: 'Productions', path: '/productions' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  const isDark = theme === 'dark'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '10px 16px' : '16px 16px',
        background: scrolled
          ? (isDark ? 'rgba(15,15,15,0.95)' : 'rgba(255,255,255,0.95)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid var(--border)` : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo height={28} />
        </Link>

        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {links.map(link => (
            <Link key={link.path} to={link.path} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 1,
              textTransform: 'uppercase', color: 'var(--text-secondary)', textDecoration: 'none',
              padding: '8px 0', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >{link.label}</Link>
          ))}
          <Link to="/micmtaani" style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none',
            padding: '8px 0',
          }}>Mic Mtaani</Link>

          <button onClick={toggleTheme} style={{
            background: 'none', border: '1.5px solid var(--border)', borderRadius: 20,
            width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          aria-label="Toggle theme"
          >
            {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          {isAdmin && (
            <Link to="/admin" style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 1,
              textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none',
            }}>Admin</Link>
          )}
          {user ? (
            <button onClick={async () => { await logout(); navigate('/'); }} style={{
              background: 'transparent', border: `1.5px solid var(--border)`, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
              textTransform: 'uppercase', color: 'var(--text)', padding: '10px 20px', borderRadius: 6,
              transition: 'all 0.2s', minHeight: 40,
            }}>Logout</button>
          ) : (
            <Link to="/login" className="btn-red" style={{ padding: '10px 20px', fontSize: 11, minHeight: 40 }}>Sign In</Link>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-toggle"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', padding: 12, minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconX size={24} color="var(--text)" /> : <IconMenu size={24} color="var(--text)" />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
              background: isDark ? 'rgba(15,15,15,0.98)' : 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column',
              paddingTop: 72, paddingLeft: 24, paddingRight: 24, paddingBottom: 32,
              overflowY: 'auto',
            }}
          >
            {links.map((link, i) => (
              <motion.div key={link.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={link.path} onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'Chonburi, cursive', fontSize: 28, color: 'var(--text)',
                    textDecoration: 'none', display: 'block', padding: '14px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: links.length * 0.05 }}>
              <Link to="/micmtaani" onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'Chonburi, cursive', fontSize: 28, color: 'var(--red)',
                  textDecoration: 'none', display: 'block', padding: '14px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                Mic Mtaani
              </Link>
            </motion.div>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24 }}>
              <button onClick={() => { toggleTheme(); setMenuOpen(false) }} style={{
                background: 'none', border: '1.5px solid var(--border)', borderRadius: 8,
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)',
                cursor: 'pointer', textAlign: 'left', padding: '14px 16px', minHeight: 48,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                      fontFamily: 'Chonburi, cursive', fontSize: 20, color: 'var(--red)',
                      textDecoration: 'none', padding: '10px 0',
                    }}>Admin</Link>
                  )}
                  <button onClick={async () => { setMenuOpen(false); await logout(); navigate('/'); }} style={{
                    background: 'none', border: '1.5px solid var(--border)', borderRadius: 8,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)',
                    cursor: 'pointer', textAlign: 'left', padding: '14px 16px', minHeight: 48,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-red" style={{ textAlign: 'center', justifyContent: 'center' }}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
