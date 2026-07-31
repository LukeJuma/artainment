import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mmAPI, MMBusiness } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconMapPin, IconClock, IconStar } from '../components/ui/Icons'

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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>Local Businesses</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>Support local in Nakuru County.</p>

        {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
        {!businesses.length && !error ? <Loader /> : (
          <>
            {categories.map(cat => (
              <section key={cat} style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, margin: '0 0 12px', textTransform: 'capitalize', color: 'var(--text)', borderBottom: '2px solid var(--red)', paddingBottom: 6, display: 'inline-block' }}>{cat}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
                  {businesses.filter(b => b.category === cat).map(biz => (
                    <Link key={biz.id} to={`/micmtaani/business/${biz.slug}`} style={{
                      display: 'flex', flexDirection: 'column', background: 'var(--bg)', borderRadius: 8, padding: 20,
                      border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)',
                      transition: 'box-shadow 0.2s', minHeight: 44,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {biz.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={12} color="#F59E0B" filled /> FEATURED</span>}
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0' }}>{biz.name}</h3>
                      <p style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.4 }}>{biz.description}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><IconMapPin size={12} /> {biz.location}</p>
                      {biz.opening_hours && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={11} /> {biz.opening_hours}</p>}
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

const wrap: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }
