import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { NAV_LINKS } from '../../lib/constants'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '14px 48px' : '24px 48px',
        background: scrolled ? 'rgba(41,40,44,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>THE ARTAINMENT</span>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 11, color: '#F7BB0E', letterSpacing: 4, fontStyle: 'italic' }}>Art of Film</span>
      </Link>

      <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {NAV_LINKS.map(link => (
          <Link key={link.path} to={link.path} style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: 1.5,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
            padding: '4px 0', transition: 'color 0.2s',
          }}>
            {link.label}
          </Link>
        ))}
        <Link to="/micmtaani" style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', color: '#F00000', textDecoration: 'none',
          padding: '4px 0', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 20,
        }}>Mic Mtaani</Link>
        {isAdmin && (
          <Link to="/admin" style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: 1.5,
            textTransform: 'uppercase', color: '#F7BB0E', textDecoration: 'none',
          }}>Admin</Link>
        )}
        {user ? (
          <button onClick={async () => { await logout(); navigate('/'); }} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 2,
            textTransform: 'uppercase', color: '#fff', padding: '10px 22px', borderRadius: 6,
          }}>Logout</button>
        ) : (
          <Link to="/login" style={{
            background: '#F00000', border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 2,
            textTransform: 'uppercase', color: '#fff', padding: '10px 22px', borderRadius: 6,
            textDecoration: 'none',
          }}>Sign In</Link>
        )}
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="nav-mobile-toggle"
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', padding: 8 }}
        aria-label="Toggle menu"
      >
        <div style={{ width: 24, height: 2, background: '#fff', marginBottom: 5, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <div style={{ width: 24, height: 2, background: '#fff', marginBottom: 5, opacity: menuOpen ? 0 : 1, transition: 'all 0.3s' }} />
        <div style={{ width: 24, height: 2, background: '#fff', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'rgba(41,40,44,0.98)', backdropFilter: 'blur(20px)',
              padding: '24px 48px', display: 'flex', flexDirection: 'column', gap: 20,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 500, color: '#fff', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
            <Link to="/micmtaani" onClick={() => setMenuOpen(false)}
              style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 500, color: '#F00000', textDecoration: 'none' }}>
              Mic Mtaani
            </Link>
            {user && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}
                style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 500, color: '#F7BB0E', textDecoration: 'none' }}>
                Admin
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
