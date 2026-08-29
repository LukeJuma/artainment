import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMArticle, MMPaginated } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconClock } from '../components/ui/Icons'

function timeAgo(date: string | null) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function MicMtaaniTagPage() {
  const { tag } = useParams<{ tag: string }>()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const [data, setData] = useState<MMPaginated<MMArticle> | null>(null)

  useEffect(() => {
    if (!tag) return
    mmAPI.articles({ tag, page }).then(setData).catch(() => {})
  }, [tag, page])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <MMNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text)' }}>#{tag}</span>
        </nav>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 24px', color: 'var(--text)' }}>#{tag}</h1>
        {!data ? <Loader /> : (
          <div style={{ display: 'grid', gap: 16 }}>
            {data.data.map(a => (
              <Link key={a.id} to={`/micmtaani/article/${a.slug}`} style={{
                display: 'grid', gridTemplateColumns: a.image_url ? '120px 1fr' : '1fr', gap: 16,
                textDecoration: 'none', color: 'var(--text)', padding: 16, borderRadius: 8,
                background: 'var(--bg)', border: '1px solid var(--border)',
                minHeight: 44,
              }}>
                {a.image_url && <img src={a.image_url} alt="" loading="lazy" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <h3 style={{ fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{a.headline}</h3>
                  {a.subtitle && <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0' }}>{a.subtitle}</p>}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12} /> {a.reading_time} min read &middot; {timeAgo(a.published_at)}</span>
                </div>
              </Link>
            ))}
            {data.data.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>No articles found for this tag.</p>}
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}
