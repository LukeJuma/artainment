import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mmAPI, MMBusiness } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'

export function MicMtaaniBusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [biz, setBiz] = useState<MMBusiness | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    mmAPI.business(slug).then(setBiz).catch(e => setError(e.message))
  }, [slug])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', color: '#111' }}>
      <MMNavbar />
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '32px 24px' }}>
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: '#F00000', textDecoration: 'none' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/micmtaani/businesses" style={{ color: '#F00000', textDecoration: 'none' }}>Businesses</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#333' }}>{biz?.name || '...'}</span>
        </nav>
        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        {!biz ? <Loader /> : (
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, border: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563EB', background: '#EFF6FF', padding: '3px 10px', borderRadius: 4 }}>{biz.category}</span>
              {biz.is_featured && <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>FEATURED</span>}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>{biz.name}</h1>
            <p style={{ fontSize: 16, color: '#555', lineHeight: 1.6, margin: '0 0 24px' }}>{biz.description}</p>
            <div style={{ display: 'grid', gap: 12, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
              {biz.location && <div><strong style={{ fontSize: 13, color: '#333' }}>Location:</strong> <span style={{ fontSize: 14, color: '#555' }}>{biz.location}</span></div>}
              {biz.phone && <div><strong style={{ fontSize: 13, color: '#333' }}>Phone:</strong> <a href={`tel:${biz.phone}`} style={{ fontSize: 14, color: '#F00000', textDecoration: 'none' }}>{biz.phone}</a></div>}
              {biz.email && <div><strong style={{ fontSize: 13, color: '#333' }}>Email:</strong> <a href={`mailto:${biz.email}`} style={{ fontSize: 14, color: '#F00000', textDecoration: 'none' }}>{biz.email}</a></div>}
              {biz.opening_hours && <div><strong style={{ fontSize: 13, color: '#333' }}>Hours:</strong> <span style={{ fontSize: 14, color: '#555' }}>{biz.opening_hours}</span></div>}
              {biz.website && <div><strong style={{ fontSize: 13, color: '#333' }}>Website:</strong> <a href={biz.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#F00000', textDecoration: 'none' }}>{biz.website}</a></div>}
            </div>
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}
