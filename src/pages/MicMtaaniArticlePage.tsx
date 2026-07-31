import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mmAPI, MMArticle } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconClock, IconEye } from '../components/ui/Icons'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=800&h=500&fit=crop&auto=format'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function MicMtaaniArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<MMArticle | null>(null)
  const [related, setRelated] = useState<MMArticle[]>([])
  const [commentName, setCommentName] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [commentMsg, setCommentMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    mmAPI.article(slug)
      .then(d => { setArticle(d.article); setRelated(d.related) })
      .catch(e => setError(e.message))
  }, [slug])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug || !commentName || !commentBody) return
    try {
      await mmAPI.addComment(slug, { name: commentName, body: commentBody })
      setCommentMsg('Comment submitted for review.')
      setCommentName('')
      setCommentBody('')
    } catch { setCommentMsg('Failed to submit comment.') }
  }

  if (error) return <div style={wrap}><MMNavbar /><p style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>Article not found.</p></div>
  if (!article) return <div style={wrap}><Loader /></div>

  return (
    <div style={wrap}>
      <MMNavbar />

      <div style={{ position: 'relative', height: 'clamp(260px, 50vw, 400px)', overflow: 'hidden' }}>
        <img src={article.image_url || PLACEHOLDER_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 24px', maxWidth: 800 }}>
          {article.category && (
            <Link to={`/micmtaani/category/${article.category.slug}`} style={{
              padding: '3px 10px', borderRadius: 4,
              fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
              background: article.category.color || 'var(--red)', color: '#fff', textDecoration: 'none',
              minHeight: 44, display: 'inline-flex', alignItems: 'center',
            }}>{article.category.name}</Link>
          )}
          <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#fff', margin: '12px 0 8px', lineHeight: 1.2 }}>
            {article.headline}
          </h1>
          {article.subtitle && <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{article.subtitle}</p>}
        </div>
      </div>

      <article style={{ maxWidth: 740, margin: '0 auto', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          {article.author && <span>By <strong style={{ color: 'var(--text)' }}>{article.author.name}</strong></span>}
          <span>&middot;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconClock size={13} /> {article.published_at ? timeAgo(article.published_at) : ''}</span>
          <span>&middot;</span>
          <span>{article.reading_time} min read</span>
          <span>&middot;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconEye size={13} /> {article.views.toLocaleString()} views</span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
            {article.tags.map(tag => (
              <Link key={tag} to={`/micmtaani/tag/${tag}`} style={{
                display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 4,
                fontSize: 11, fontWeight: 500, background: 'var(--bg-muted)', color: 'var(--text-secondary)', textDecoration: 'none',
                minHeight: 44,
              }}>#{tag}</Link>
            ))}
          </div>
        )}

        {article.body && (
          <div
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(15px, 2.5vw, 17px)', lineHeight: 1.8, color: 'var(--text)' }}
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        )}

        <div style={{ marginTop: 40, padding: '20px 0', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Share:</span>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1DA1F2', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Twitter</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#4267B2', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Facebook</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(article.headline + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#25D366', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>WhatsApp</a>
        </div>

        <section style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, margin: '0 0 16px', color: 'var(--text)' }}>Comments</h3>
          {article.comments && article.comments.length > 0 ? (
            article.comments.map(c => (
              <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--bg-muted)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--text)' }}>{c.name}</p>
                <p style={{ fontSize: 14, margin: '4px 0 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.body}</p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No comments yet. Be the first to share your thoughts.</p>
          )}

          <form onSubmit={handleComment} style={{ marginTop: 20, padding: 20, background: 'var(--bg)', borderRadius: 8 }}>
            <h4 style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', fontWeight: 600, margin: '0 0 12px' }}>Leave a comment</h4>
            <input
              type="text" placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} required
              style={{ width: '100%', padding: '12px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 16, marginBottom: 10, outline: 'none', background: 'var(--bg)', color: 'var(--text)', minHeight: 48, boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Write your comment..." value={commentBody} onChange={e => setCommentBody(e.target.value)} required
              rows={4} style={{ width: '100%', padding: '12px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 16, marginBottom: 10, resize: 'vertical', outline: 'none', background: 'var(--bg)', color: 'var(--text)', minHeight: 48, boxSizing: 'border-box' }}
            />
            <button type="submit" style={{
              padding: '10px 24px', minHeight: 44, background: 'var(--red)', color: '#fff', border: 'none',
              borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Post Comment</button>
            {commentMsg && <p style={{ fontSize: 13, color: '#059669', marginTop: 8 }}>{commentMsg}</p>}
          </form>
        </section>
      </article>

      {related.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: 16, borderTop: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, margin: '0 0 16px', color: 'var(--text)' }}>Related Stories</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {related.map(r => (
              <Link key={r.id} to={`/micmtaani/article/${r.slug}`} style={{
                display: 'flex', textDecoration: 'none', color: 'var(--text)', flexDirection: 'column',
                background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden',
                minHeight: 44,
              }}>
                <img src={r.image_url || PLACEHOLDER_IMG} alt="" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: 16, flex: 1 }}>
                  <h4 style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{r.headline}</h4>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12} /> {r.reading_time} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }
