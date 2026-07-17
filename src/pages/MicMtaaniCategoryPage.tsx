import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMArticle, MMPaginated } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=800&h=500&fit=crop&auto=format'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function MicMtaaniCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const [data, setData] = useState<MMPaginated<MMArticle> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setData(null)
    mmAPI.articles({ category: slug, page })
      .then(setData)
      .catch(e => setError(e.message))
  }, [slug, page])

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams)
    if (p <= 1) params.delete('page')
    else params.set('page', String(p))
    setSearchParams(params)
  }

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: '#F00000', textDecoration: 'none' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#333', textTransform: 'capitalize' }}>{slug?.replace(/-/g, ' ')}</span>
        </nav>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 24px', color: '#111', textTransform: 'capitalize' }}>
          {slug?.replace(/-/g, ' ')}
        </h1>

        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        {!data ? <Loader /> : (
          <>
            <div style={{ display: 'grid', gap: 16 }}>
              {data.data.map(a => (
                <Link key={a.id} to={`/micmtaani/article/${a.slug}`} style={{
                  display: 'grid', gridTemplateColumns: a.image_url ? '220px 1fr' : '1fr', gap: 16,
                  textDecoration: 'none', color: '#111', padding: 16, borderRadius: 8,
                  background: '#fff', border: '1px solid #eee', transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {a.image_url && <img src={a.image_url} alt="" style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 6 }} />}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: '4px 0', lineHeight: 1.3 }}>{a.headline}</h3>
                    {a.subtitle && <p style={{ fontSize: 14, color: '#555', margin: '4px 0' }}>{a.subtitle}</p>}
                    <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                      {a.reading_time} min read &middot; {timeAgo(a.published_at)}
                    </div>
                  </div>
                </Link>
              ))}
              {data.data.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: 60 }}>No articles in this category yet.</p>
              )}
            </div>
            {data.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 36, height: 36, borderRadius: 6, border: '1px solid #ddd', background: p === data.current_page ? '#F00000' : '#fff',
                    color: p === data.current_page ? '#fff' : '#333', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#f8f9fa', color: '#111' }
