import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { SectionLabel } from '../components/ui/SectionLabel'

const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px', fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'var(--text)', outline: 'none', minHeight: 48, boxSizing: 'border-box' }

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SectionLabel text="Welcome Back" />
          <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(32px, 6vw, 42px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Sign In</h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-secondary)' }}>Access your Artainment account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div style={{ background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 6, padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--red)' }}>{error}</div>}
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@theartainment.co.ke" required />
          </div>
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" required />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: 'var(--red)', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text)', padding: '18px 36px', minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>
          <Link to="/register" style={{ color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Create an account</Link>
        </p>
      </motion.div>
    </div>
  )
}
