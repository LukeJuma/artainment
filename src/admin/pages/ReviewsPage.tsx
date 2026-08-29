import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Flag, Search, X, Loader2, Trash2, Check } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type Review } from '../../lib/api'

export function ReviewsPage() {
  const { token } = useAuth()
  const { data: reviews, loading, refetch } = useApi(() => adminAPI.reviews(token!), [token])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<number | null>(null)

  const filtered = (reviews ?? []).filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.film?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.comment || '').toLowerCase().includes(search.toLowerCase())
  )

  const pending = (reviews ?? []).filter(r => !r.is_approved).length

  const toggleApprove = async (review: Review) => {
    if (!token) return
    setSaving(review.id)
    try {
      await adminAPI.updateReview(token, review.id, { is_approved: !review.is_approved })
      refetch()
    } catch {}
    finally { setSaving(null) }
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this review?')) return
    try { await adminAPI.deleteReview(token, id); refetch() } catch {}
  }

  return (
    <div>
      <PageHeader title="Reviews" description="Manage user reviews and feedback" />
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <span className="badge badge-warning">{pending} pending approval</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <Star size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
          <h3>No reviews found</h3>
          <p>Reviews submitted through the site will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="admin-card"
              style={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{review.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                    {review.is_approved ? <span className="badge badge-success"><Check size={9} /> Approved</span> : <span className="badge badge-warning"><Flag size={9} /> Pending</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>on</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{review.film?.title || 'General feedback'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} style={{ color: s <= review.rating ? 'var(--admin-accent)' : 'var(--admin-text-faint)', fill: s <= review.rating ? 'var(--admin-accent)' : 'none' }} />
                    ))}
                  </div>
                  {review.comment && <p style={{ fontSize: 13, color: 'var(--admin-text-secondary)', lineHeight: 1.6 }}>{review.comment}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }} onClick={() => toggleApprove(review)} disabled={saving === review.id}>
                    {saving === review.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" style={{ padding: 5 }} onClick={() => handleDelete(review.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
