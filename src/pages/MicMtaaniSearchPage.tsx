import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMArticle } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconSearch, IconClock } from '../components/ui/Icons'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function MicMtaaniSearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [query, setQuery] = useState(q)
  const [results, setResults] = useState<MMArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (q && q.length >= 2) {
      setQuery(q)
      setLoading(true)
      setSearched(true)
      mmAPI.search(q)
        .then(d => setResults(d.articles))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }
  }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length < 2) return
    window.location.search = `?q=${encodeURIComponent(query)}`
  }

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 20px', color: 'var(--text)' }}>Search Mic Mtaani</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search articles, news, events..."
              style={{
                width: '100%', padding: '12px 16px 12px 40px', borderRadius: 6, border: '1px solid var(--border)',
                fontSize: 16, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', color: 'var(--text)',
                minHeight: 48, boxSizing: 'border-box',
              }}
            />
            <IconSearch size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button type="submit" style={{
            padding: '12px 24px', minHeight: 44, background: 'var(--red)', color: '#fff', border: 'none',
            borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center',
          }}>Search</button>
        </form>

        {searched && !loading && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{q}"
          </p>
        )}

        {loading ? <Loader /> : (
          <div style={{ display: 'grid', gap: 12 }}>
            {results.map(a => (
              <Link key={a.id} to={`/micmtaani/article/${a.slug}`} style={{
                display: 'grid', gridTemplateColumns: a.image_url ? '100px 1fr' : '1fr', gap: 16,
                textDecoration: 'none', color: 'var(--text)', padding: 16, borderRadius: 8,
                background: 'var(--bg)', border: '1px solid var(--border)',
                minHeight: 44,
              }}>
                {a.image_url && <img src={a.image_url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <h3 style={{ fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{a.headline}</h3>
                  {a.excerpt && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>{a.excerpt.slice(0, 150)}...</p>}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12} /> {timeAgo(a.published_at)} &middot; {a.reading_time} min read</span>
                </div>
              </Link>
            ))}
            {searched && results.length === 0 && !loading && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>No results found. Try a different search term.</p>
            )}
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }
