import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SectionLabel } from '../components/ui/SectionLabel'

const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '16px 20px', fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#fff', outline: 'none' }

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
    <div style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SectionLabel text="Welcome Back" />
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 42, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Sign In</h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Access your Artainment account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div style={{ background: 'rgba(240,0,0,0.1)', border: '1px solid rgba(240,0,0,0.3)', borderRadius: 6, padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#F00000' }}>{error}</div>}
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@theartainment.co.ke" required />
          </div>
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" required />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: '#F00000', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '18px 36px', borderRadius: 6, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          <Link to="/register" style={{ color: '#F00000', textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
