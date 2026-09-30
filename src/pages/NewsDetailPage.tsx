import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { newsAPI, type NewsArticle } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { Nav } from '../components/ui/Nav'
import { Footer } from '../components/ui/Footer'
import { Badge } from '../components/ui/Badge'

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    setError(false)
    setArticle(null)
    newsAPI.get(slug)
      .then(setArticle)
      .catch(() => setError(true))
  }, [slug])

  if (error) {
    return (
      <>
        <Nav />
        <div style={{ padding: '140px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: 'var(--text)', marginBottom: 24 }}>
            Story not found.
          </p>
          <Link to="/" className="btn-outline">Back Home</Link>
        </div>
        <Footer />
      </>
    )
  }

  if (!article) return <Loader />

  return (
    <>
      <Nav />
      <article style={{ paddingTop: 72 }}>
        {article.image_url && (
          <div style={{ position: 'relative', height: 'clamp(280px, 48vw, 440px)', overflow: 'hidden' }}>
            <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)' }} />
          </div>
        )}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
            <Badge variant="brand">{article.category}</Badge>
            {article.published_at && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-muted)' }}>
                {new Date(article.published_at).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 0.95, color: 'var(--text)', margin: '0 0 20px' }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ fontFamily: "'Domine', serif", fontSize: 18, lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 32px' }}>
              {article.excerpt}
            </p>
          )}
          {article.body && (
            <div
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.85, color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.body) }}
            />
          )}
          <div style={{ marginTop: 48 }}>
            <Link to="/" className="btn-outline">← Back Home</Link>
          </div>
        </div>
      </article>
      <Footer />
    </>
  )
}
