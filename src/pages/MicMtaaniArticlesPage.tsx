import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMArticle, MMPaginated, MMCategory } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconClock, IconEye } from '../components/ui/Icons'

function timeAgo(date: string | null) {
  if (!date) return ''
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>All News</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>Stay updated with the latest from Nakuru County.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => setCategory('')} style={{
            padding: '8px 16px', minHeight: 44, borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: !category ? 'var(--red)' : 'var(--border)', color: !category ? '#fff' : 'var(--text-secondary)',
            display: 'inline-flex', alignItems: 'center',
          }}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.slug)} style={{
              padding: '8px 16px', minHeight: 44, borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: category === cat.slug ? (cat.color || 'var(--red)') : 'var(--border)',
              color: category === cat.slug ? '#fff' : 'var(--text-secondary)',
              display: 'inline-flex', alignItems: 'center',
            }}>{cat.name}</button>
          ))}
        </div>

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
                  {a.image_url && <img src={a.image_url} alt="" loading="lazy" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />}
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      {a.is_breaking && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase' }}>BREAKING</span>}
                      {a.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>FEATURED</span>}
                      {a.category && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: a.category.color || 'var(--red)', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{a.category.name}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 700, margin: '4px 0', lineHeight: 1.3 }}>{a.headline}</h3>
                    {a.subtitle && <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.4 }}>{a.subtitle}</p>}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><IconClock size={12} /> {a.reading_time} min read</span>
                      <span>&middot;</span>
                      <span>{timeAgo(a.published_at)}</span>
                      <span>&middot;</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><IconEye size={12} /> {a.views?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
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
