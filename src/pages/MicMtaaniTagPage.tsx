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

export function MicMtaaniTagPage() {
  const { tag } = useParams<{ tag: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const [data, setData] = useState<MMPaginated<MMArticle> | null>(null)

  useEffect(() => {
    if (!tag) return
    mmAPI.articles({ tag, page }).then(setData).catch(() => {})
  }, [tag, page])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', color: '#111' }}>
      <MMNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: '#F00000', textDecoration: 'none' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#333' }}>#{tag}</span>
        </nav>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 24px', color: '#111' }}>#{tag}</h1>
        {!data ? <Loader /> : (
          <div style={{ display: 'grid', gap: 16 }}>
            {data.data.map(a => (
              <Link key={a.id} to={`/micmtaani/article/${a.slug}`} style={{
                display: 'grid', gridTemplateColumns: a.image_url ? '220px 1fr' : '1fr', gap: 16,
                textDecoration: 'none', color: '#111', padding: 16, borderRadius: 8,
                background: '#fff', border: '1px solid #eee',
              }}>
                {a.image_url && <img src={a.image_url} alt="" style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{a.headline}</h3>
                  {a.subtitle && <p style={{ fontSize: 14, color: '#555', margin: '4px 0' }}>{a.subtitle}</p>}
                  <span style={{ fontSize: 12, color: '#999', marginTop: 8, display: 'block' }}>{a.reading_time} min read &middot; {timeAgo(a.published_at)}</span>
                </div>
              </Link>
            ))}
            {data.data.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 60 }}>No articles found for this tag.</p>}
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}
