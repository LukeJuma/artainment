import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthShell, AuthField, authInputStyle, FieldIcon, ICON_MAIL, ICON_USER, ICON_LOCK } from '../components/ui/AuthShell'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agree) {
      setError('Please agree to the Terms and Conditions to continue.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(name, email, password, passwordConfirmation)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Join Us"
      title="Sign Up"
      panelTitle="Don't Have An Account?"
      panelCopy="Register to access all the features of our service. Films, premieres and community in one place. It's free!"
      panelPoints={['Watch films, series and podcasts', 'Get premiere alerts first', 'Join the Mic Mtaani conversation']}
      switchPrompt="Already a member?"
      switchLabel="Sign In"
      switchTo="/login"
    >
      <form onSubmit={handleSubmit}>
        {error && <div style={{ background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 'var(--ds-radius-md)', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--red)', marginBottom: 20 }}>{error}</div>}
        <AuthField label="Email" icon={<FieldIcon d={ICON_MAIL} />}>
          <input style={authInputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </AuthField>
        <AuthField label="Username" icon={<FieldIcon d={ICON_USER} />}>
          <input style={authInputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required autoComplete="username" />
        </AuthField>
        <AuthField label="Password" icon={<FieldIcon d={ICON_LOCK} />}>
          <input style={authInputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} autoComplete="new-password" />
        </AuthField>
        <AuthField label="Confirm Password" icon={<FieldIcon d={ICON_LOCK} />}>
          <input style={authInputStyle} type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="Repeat password" required autoComplete="new-password" />
        </AuthField>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', margin: '4px 0 24px', lineHeight: 1.5 }}>
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--ds-brand)', flexShrink: 0 }} />
          <span>I agree to the <strong style={{ color: 'var(--text)' }}>Terms</strong> and <strong style={{ color: 'var(--text)' }}>Conditions</strong> of Service</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', background: 'transparent', border: '1.5px solid var(--ds-card-line)', cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: 'var(--ds-text)', padding: '16px', borderRadius: 'var(--ds-radius-pill)',
            opacity: loading ? 0.7 : 1, minHeight: 52,
          }}
        >
          {loading ? 'Creating...' : 'Sign Up →'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-muted)' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--ds-brand-500)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
