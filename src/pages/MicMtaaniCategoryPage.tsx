import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMArticle, MMPaginated } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconClock } from '../components/ui/Icons'

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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{slug?.replace(/-/g, ' ')}</span>
        </nav>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 24px', color: 'var(--text)', textTransform: 'capitalize' }}>
          {slug?.replace(/-/g, ' ')}
        </h1>

        {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
        {!data ? <Loader /> : (
          <>
            <div style={{ display: 'grid', gap: 16 }}>
              {data.data.map(a => (
                <Link key={a.id} to={`/micmtaani/article/${a.slug}`} style={{
                  display: 'grid', gridTemplateColumns: a.image_url ? '120px 1fr' : '1fr', gap: 16,
                  textDecoration: 'none', color: 'var(--text)', padding: 16, borderRadius: 8,
                  background: 'var(--bg)', border: '1px solid var(--border)', transition: 'box-shadow 0.2s',
                  minHeight: 44,
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {a.image_url && <img src={a.image_url} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />}
                  <div>
                    <h3 style={{ fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 700, margin: '4px 0', lineHeight: 1.3 }}>{a.headline}</h3>
                    {a.subtitle && <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0' }}>{a.subtitle}</p>}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconClock size={12} /> {a.reading_time} min read &middot; {timeAgo(a.published_at)}
                    </div>
                  </div>
                </Link>
              ))}
              {data.data.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>No articles in this category yet.</p>
              )}
            </div>
            {data.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
                {Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    minWidth: 44, minHeight: 44, borderRadius: 6, border: '1px solid var(--border)', background: p === data.current_page ? 'var(--red)' : 'var(--bg)',
                    color: p === data.current_page ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
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

const wrap: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }
