import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mmAPI, MMBusiness } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'

export function MicMtaaniBusinessesPage() {
  const [businesses, setBusinesses] = useState<MMBusiness[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    mmAPI.businesses().then(setBusinesses).catch(e => setError(e.message))
  }, [])

  const categories = [...new Set(businesses.map(b => b.category))]

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Local Businesses</h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>Support local in Nakuru County.</p>

        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        {!businesses.length && !error ? <Loader /> : (
          <>
            {categories.map(cat => (
              <section key={cat} style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', textTransform: 'capitalize', color: '#111', borderBottom: '2px solid #F00000', paddingBottom: 6, display: 'inline-block' }}>{cat}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {businesses.filter(b => b.category === cat).map(biz => (
                    <Link key={biz.id} to={`/micmtaani/business/${biz.slug}`} style={{
                      display: 'block', background: '#fff', borderRadius: 8, padding: 20,
                      border: '1px solid #eee', textDecoration: 'none', color: '#111',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {biz.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>FEATURED</span>}
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0' }}>{biz.name}</h3>
                      <p style={{ fontSize: 13, color: '#666', margin: '4px 0', lineHeight: 1.4 }}>{biz.description}</p>
                      <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0' }}>{biz.location}</p>
                      {biz.opening_hours && <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0' }}>{biz.opening_hours}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#f8f9fa', color: '#111' }
