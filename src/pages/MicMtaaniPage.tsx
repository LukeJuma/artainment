import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mmAPI, MMHomepage } from '../lib/api'
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

function CatBadge({ name, color }: { name: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
      background: color || '#F00000', color: '#fff',
    }}>{name}</span>
  )
}

export function MicMtaaniPage() {
  const [data, setData] = useState<MMHomepage | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    mmAPI.homepage()
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div style={mmWrap}><MMNavbar /><p style={{ textAlign: 'center', padding: 80, color: '#666' }}>Failed to load: {error}</p></div>
  if (!data) return <div style={mmWrap}><Loader /></div>

  const { breaking, featured, latest, categories, trending, events, businesses } = data

  return (
    <div style={mmWrap}>
      <MMNavbar />

      {/* Breaking Banner */}
      {breaking && (
        <Link to={`/micmtaani/article/${breaking.slug}`} style={{
          display: 'block', background: '#DC2626', color: '#fff',
          padding: '10px 24px', textDecoration: 'none',
          fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
          letterSpacing: 0.5, textAlign: 'center',
        }}>
          <span style={{ textTransform: 'uppercase', marginRight: 8, fontWeight: 700 }}>BREAKING</span>
          {breaking.headline.replace('BREAKING: ', '')}
        </Link>
      )}

      {/* Hero Featured */}
      {featured && (
        <section style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
          <img
            src={featured.image_url || PLACEHOLDER_IMG}
            alt={featured.headline}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 24px 40px', maxWidth: 800,
          }}>
            {featured.category && <CatBadge name={featured.category.name} color={featured.category.color || undefined} />}
            <Link to={`/micmtaani/article/${featured.slug}`} style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 36, fontWeight: 700,
                color: '#fff', margin: '12px 0 8px', lineHeight: 1.2,
              }}>{featured.headline}</h1>
            </Link>
            {featured.subtitle && (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                {featured.subtitle}
              </p>
            )}
            <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {featured.reading_time} min read &middot; {timeAgo(featured.published_at || '')}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }} className="mm-main-grid">

          {/* Left: Latest Articles */}
          <div>
            <h2 style={sectionTitle}>Latest News</h2>
            <div style={{ display: 'grid', gap: 20 }}>
              {latest.map(article => (
                <Link key={article.id} to={`/micmtaani/article/${article.slug}`} style={{
                  display: 'grid', gridTemplateColumns: article.image_url ? '200px 1fr' : '1fr', gap: 16,
                  textDecoration: 'none', color: '#111', padding: 16, borderRadius: 8,
                  background: '#fff', border: '1px solid #eee', transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {article.image_url && (
                    <img src={article.image_url} alt="" style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <div>
                    {article.is_breaking && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: 1 }}>BREAKING</span>}
                    {article.is_featured && !article.is_breaking && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 1 }}>FEATURED</span>}
                    <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 700, margin: '4px 0', lineHeight: 1.3, color: '#111' }}>
                      {article.headline}
                    </h3>
                    {article.subtitle && (
                      <p style={{ fontSize: 14, color: '#555', margin: '4px 0', lineHeight: 1.4 }}>
                        {article.subtitle}
                      </p>
                    )}
                    <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                      {article.reading_time} min read &middot; {timeAgo(article.published_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/micmtaani/news" style={{
              display: 'block', textAlign: 'center', padding: '14px 0', marginTop: 20,
              background: '#F00000', color: '#fff', fontWeight: 600, fontSize: 13,
              letterSpacing: 1, textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none',
            }}>View All News</Link>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Trending */}
            <div style={sidebarBox}>
              <h3 style={sidebarTitle}>Trending</h3>
              {trending.map((t, i) => (
                <Link key={t.id} to={`/micmtaani/article/${t.slug}`} style={{
                  display: 'flex', gap: 12, padding: '10px 0',
                  borderBottom: i < trending.length - 1 ? '1px solid #eee' : 'none',
                  textDecoration: 'none', color: '#111',
                }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#ddd', lineHeight: 1, minWidth: 28 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{t.headline}</p>
                    <span style={{ fontSize: 11, color: '#999' }}>{t.views.toLocaleString()} views</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Categories */}
            <div style={sidebarBox}>
              <h3 style={sidebarTitle}>Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map(cat => (
                  <Link key={cat.id} to={`/micmtaani/category/${cat.slug}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '5px 12px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                    background: '#f5f5f5', color: '#333', textDecoration: 'none',
                    borderLeft: `3px solid ${cat.color || '#F00000'}`,
                  }}>
                    {cat.name}
                    {cat.articles_count != null && <span style={{ color: '#999', fontSize: 11 }}>({cat.articles_count})</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Events */}
            {events.length > 0 && (
              <div style={sidebarBox}>
                <h3 style={sidebarTitle}>Upcoming Events</h3>
                {events.slice(0, 3).map(ev => (
                  <div key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#111' }}>{ev.title}</p>
                    <p style={{ fontSize: 12, color: '#777', margin: '4px 0 0' }}>
                      {new Date(ev.starts_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} &middot; {ev.location}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Newsletter */}
            <div style={{ ...sidebarBox, background: '#111', color: '#fff' }}>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Stay Informed</h3>
              <p style={{ fontSize: 13, color: '#ccc', margin: '0 0 12px', lineHeight: 1.5 }}>Get the latest Nakuru news delivered to your inbox.</p>
              <MMNewsletterCompact />
            </div>
          </div>
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={sectionTitle}>Upcoming Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {events.map(ev => (
                <div key={ev.id} style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#F00000', background: '#FEE2E2', padding: '2px 8px', borderRadius: 3 }}>{ev.category}</span>
                    {ev.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>FEATURED</span>}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#111' }}>{ev.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>{ev.description}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                    {new Date(ev.starts_at).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} &middot; {ev.location}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Businesses */}
        {businesses.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={sectionTitle}>Local Businesses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {businesses.map(biz => (
                <Link key={biz.id} to={`/micmtaani/business/${biz.slug}`} style={{
                  display: 'block', background: '#fff', borderRadius: 8, padding: 20,
                  border: '1px solid #eee', textDecoration: 'none', color: '#111',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: 3 }}>{biz.category}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 4px' }}>{biz.name}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px', lineHeight: 1.4 }}>{biz.description}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{biz.location}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Submit CTA */}
        <section style={{ marginTop: 48, padding: 40, background: '#f8f9fa', borderRadius: 12, textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Have a story?</h2>
          <p style={{ fontSize: 15, color: '#666', margin: '0 0 20px' }}>Share news, events, or announcements with the Nakuru community.</p>
          <Link to="/micmtaani/submit" style={{
            display: 'inline-block', padding: '12px 32px', background: '#F00000', color: '#fff',
            fontWeight: 600, fontSize: 14, borderRadius: 6, textDecoration: 'none', letterSpacing: 0.5,
          }}>Submit a Story</Link>
        </section>
      </div>

      <MMFooter />
    </div>
  )
}

function MMNewsletterCompact() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await mmAPI.subscribe(email)
      setMsg('Subscribed!')
      setEmail('')
    } catch { setMsg('Already subscribed or error.') }
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Your email address" required
        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #333', background: '#222', color: '#fff', fontSize: 13, marginBottom: 8, outline: 'none' }}
      />
      <button type="submit" style={{
        width: '100%', padding: '10px 0', borderRadius: 6, border: 'none',
        background: '#F00000', color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', letterSpacing: 0.5,
      }}>Subscribe</button>
      {msg && <p style={{ fontSize: 12, color: '#F7BB0E', marginTop: 8 }}>{msg}</p>}
    </form>
  )
}

const mmWrap: React.CSSProperties = { minHeight: '100vh', background: '#f8f9fa', color: '#111' }
const sectionTitle: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif', fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#111',
  borderBottom: '3px solid #F00000', paddingBottom: 8, display: 'inline-block',
}
const sidebarBox: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #eee', marginBottom: 20,
}
const sidebarTitle: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#111',
}
