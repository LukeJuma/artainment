import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMArticle, MMPaginated, MMCategory } from '../lib/api'
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

export function MicMtaaniArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const category = searchParams.get('category') || ''

  const [data, setData] = useState<MMPaginated<MMArticle> | null>(null)
  const [categories, setCategories] = useState<MMCategory[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    mmAPI.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setData(null)
    mmAPI.articles({ category: category || undefined, page })
      .then(setData)
      .catch(e => setError(e.message))
  }, [category, page])

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams)
    if (p <= 1) params.delete('page')
    else params.set('page', String(p))
    setSearchParams(params)
  }

  const setCategory = (c: string) => {
    const params = new URLSearchParams(searchParams)
    if (c) params.set('category', c)
    else params.delete('category')
    params.delete('page')
    setSearchParams(params)
  }

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>All News</h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>Stay updated with the latest from Nakuru County.</p>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => setCategory('')} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: !category ? '#F00000' : '#eee', color: !category ? '#fff' : '#555',
          }}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.slug)} style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: category === cat.slug ? (cat.color || '#F00000') : '#eee',
              color: category === cat.slug ? '#fff' : '#555',
            }}>{cat.name}</button>
          ))}
        </div>

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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      {a.is_breaking && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>BREAKING</span>}
                      {a.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>FEATURED</span>}
                      {a.category && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: a.category.color || '#F00000', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{a.category.name}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: '4px 0', lineHeight: 1.3 }}>{a.headline}</h3>
                    {a.subtitle && <p style={{ fontSize: 14, color: '#555', margin: '4px 0', lineHeight: 1.4 }}>{a.subtitle}</p>}
                    <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                      {a.reading_time} min read &middot; {timeAgo(a.published_at)} &middot; {a.views?.toLocaleString()} views
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
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
