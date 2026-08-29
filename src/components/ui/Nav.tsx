import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Logo } from './Logo'
import { IconSun, IconMoon, IconMenu, IconX } from './Icons'

export function Nav({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const isOverlay = overlay && !scrolled

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
    { label: 'Movies', path: '/films' },
    { label: 'Series', path: '/series' },
    { label: 'Actors', path: '/actors' },
    { label: 'Podcasts', path: '/podcasts' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  const isDark = theme === 'dark'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '10px 16px' : '16px 16px',
        background: isOverlay
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
          : (scrolled
            ? (isDark ? 'rgba(15,15,15,0.95)' : 'rgba(255,255,255,0.95)')
            : 'transparent'),
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: !isOverlay && scrolled ? `1px solid var(--border)` : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo height={28} light={isOverlay} />
        </Link>

        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {links.map(link => (
            <Link key={link.path} to={link.path} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 1,
              textTransform: 'uppercase', color: isOverlay ? '#fff' : 'var(--text-secondary)', textDecoration: 'none',
              padding: '8px 0', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color = isOverlay ? '#fff' : 'var(--text-secondary)')}
            >{link.label}</Link>
          ))}
          <Link to="/micmtaani" style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none',
            padding: '8px 0',
          }}>Mic Mtaani</Link>

          <button onClick={toggleTheme} style={{
            background: 'none', border: isOverlay ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid var(--border)', borderRadius: 20,
            width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: isOverlay ? '#fff' : 'var(--text)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = isOverlay ? 'rgba(255,255,255,0.4)' : 'var(--border)')}
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
              background: 'transparent', border: isOverlay ? '1.5px solid rgba(255,255,255,0.45)' : '1.5px solid var(--border)', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
              textTransform: 'uppercase', color: isOverlay ? '#fff' : 'var(--text)', padding: '9px 20px', borderRadius: 999,
              transition: 'all 0.2s', minHeight: 38,
            }}>Logout</button>
          ) : (
            <Link to="/login" className="btn-red" style={{ padding: '9px 20px', fontSize: 11, minHeight: 38 }}>Sign In</Link>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-toggle"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', padding: 12, minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconX size={24} color={isOverlay ? '#fff' : 'var(--text)'} /> : <IconMenu size={24} color={isOverlay ? '#fff' : 'var(--text)'} />}
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
                    fontFamily: 'DM Sans, sans-serif', fontSize: 20, fontWeight: 600, letterSpacing: 0.5,
                    color: 'var(--text)', textDecoration: 'none', display: 'block', padding: '11px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: links.length * 0.05 }}>
              <Link to="/micmtaani" onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: 'var(--red)',
                  textDecoration: 'none', display: 'block', padding: '11px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                Mic Mtaani
              </Link>
            </motion.div>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24 }}>
              <button onClick={() => { toggleTheme(); setMenuOpen(false) }} style={{
                background: 'none', border: '1.5px solid var(--border)', borderRadius: 999,
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)',
                cursor: 'pointer', textAlign: 'left', padding: '12px 18px', minHeight: 44,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--red)',
                      textDecoration: 'none', padding: '8px 0',
                    }}>Admin</Link>
                  )}
                  <button onClick={async () => { setMenuOpen(false); await logout(); navigate('/'); }} style={{
                    background: 'none', border: '1.5px solid var(--border)', borderRadius: 999,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)',
                    cursor: 'pointer', textAlign: 'left', padding: '12px 18px', minHeight: 44,
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
