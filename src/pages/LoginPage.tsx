import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthShell, AuthField, authInputStyle, FieldIcon, ICON_MAIL, ICON_LOCK } from '../components/ui/AuthShell'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login(email, password, remember)
      setTimeout(() => {
        navigate(user?.is_admin ? '/admin' : '/', { replace: true })
      }, 100)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign In"
      panelTitle="Pick Up Where You Left Off"
      panelCopy="Your watchlist, premieres and community are waiting. One account for films, series, podcasts and Mic Mtaani."
      panelPoints={['Continue watching across devices', 'Premiere alerts for coming soon titles', 'Comment and join the community']}
      switchPrompt="New to Artainment?"
      switchLabel="Create Account"
      switchTo="/register"
    >
      <form onSubmit={handleSubmit}>
        {error && <div style={{ background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 'var(--ds-radius-md)', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--red)', marginBottom: 20 }}>{error}</div>}
        <AuthField label="Email" icon={<FieldIcon d={ICON_MAIL} />}>
          <input style={authInputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </AuthField>
        <AuthField label="Password" icon={<FieldIcon d={ICON_LOCK} />}>
          <input style={authInputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
        </AuthField>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ds-brand)' }} />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', background: 'var(--ds-brand)', border: 'none', cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: '#fff', padding: '16px', borderRadius: 'var(--ds-radius-pill)',
            boxShadow: 'var(--ds-shadow-glow-brand)', opacity: loading ? 0.7 : 1, minHeight: 52,
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-muted)' }}>
          New here? <Link to="/register" style={{ color: 'var(--ds-brand-500)', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </form>
    </AuthShell>
  )
}
