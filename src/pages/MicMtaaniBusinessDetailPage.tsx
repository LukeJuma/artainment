import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mmAPI, MMBusiness } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconStar, IconMapPin, IconClock, IconMail } from '../components/ui/Icons'

export function MicMtaaniBusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [biz, setBiz] = useState<MMBusiness | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    mmAPI.business(slug).then(setBiz).catch(e => setError(e.message))
  }, [slug])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <MMNavbar />
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 16 }}>
        <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/micmtaani/businesses" style={{ color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Businesses</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text)' }}>{biz?.name || '...'}</span>
        </nav>
        {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
        {!biz ? <Loader /> : (
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 'clamp(20px, 4vw, 32px)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563EB', background: '#EFF6FF', padding: '3px 10px', borderRadius: 4, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{biz.category}</span>
              {biz.is_featured && <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={12} color="#F59E0B" filled /> FEATURED</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 12px' }}>{biz.name}</h1>
            <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>{biz.description}</p>
            <div style={{ display: 'grid', gap: 12, padding: 20, background: 'var(--bg)', borderRadius: 8 }}>
              {biz.location && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><strong style={{ fontSize: 13, color: 'var(--text)', minWidth: 70, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconMapPin size={13} /> Location:</strong> <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{biz.location}</span></div>}
              {biz.phone && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><strong style={{ fontSize: 13, color: 'var(--text)', minWidth: 70 }}>Phone:</strong> <a href={`tel:${biz.phone}`} style={{ fontSize: 14, color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{biz.phone}</a></div>}
              {biz.email && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><strong style={{ fontSize: 13, color: 'var(--text)', minWidth: 70, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconMail size={13} /> Email:</strong> <a href={`mailto:${biz.email}`} style={{ fontSize: 14, color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{biz.email}</a></div>}
              {biz.opening_hours && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><strong style={{ fontSize: 13, color: 'var(--text)', minWidth: 70, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconClock size={13} /> Hours:</strong> <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{biz.opening_hours}</span></div>}
              {biz.website && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><strong style={{ fontSize: 13, color: 'var(--text)', minWidth: 70 }}>Website:</strong> <a href={biz.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{biz.website}</a></div>}
            </div>
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}
